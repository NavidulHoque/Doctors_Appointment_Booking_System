import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateDoctorDto, GetDoctorsDto, UpdateDoctorDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { doctorSelect } from 'src/prisma/prisma-selects';
import { UserDto } from 'src/user/dto';
import * as argon from "argon2";
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class DoctorService {
    private stripe: Stripe;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly socketGateway: SocketGateway
    ) {
        this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY') as string, {
            apiVersion: '2025-07-30.basil',
        });
    }

    async createDoctor(dto: CreateDoctorDto) {

        try {
            const { fullName, email, password, specialization, education, experience, aboutMe, fees, availableTimes } = dto

            const hashedPassword = await argon.hash(password);

            const { id, fullName: newFullName, email: newEmail } = await this.prisma.user.create({ data: { fullName, email, password: hashedPassword, role: 'DOCTOR' } })

            const newDoctor = await this.prisma.doctor.create({
                data: { userId: id, specialization, education, experience, aboutMe, fees, availableTimes }
            });

            return {
                doctor: {
                    fullName: newFullName,
                    email: newEmail,
                    ...newDoctor
                },
                message: "Doctor created successfully"
            }
        }

        catch (error) {
            // Prisma unique constraint violation
            if (error.code === 'P2002') {
                const target = error.meta?.target?.[0];

                if (target === 'email') {
                    throw new ConflictException("Email already exists");
                }
            }

            throw error;
        }
    }

    async getAllDoctors(queryParams: GetDoctorsDto) {

        const { page, limit, search, specialization, experience, fees, weeks, isActive } = queryParams

        const skip = (page - 1) * limit

        const query: any = specialization ? { specialization: { contains: specialization, mode: 'insensitive' as const } } : {} // will filter case-insensitive

        if (experience?.length === 1) {
            const [min] = experience;
            query['experience'] = { gte: min };
        }

        if (experience?.length === 2) {
            const [min, max] = experience;
            query['experience'] = { gte: min, lte: max };
        }

        if (fees?.length === 1) {
            const [max] = fees;
            query['fees'] = { lte: max };
        }

        if (fees?.length === 2) {
            const [min, max] = fees;
            query['fees'] = { gte: min, lte: max };
        }

        if (isActive !== undefined) query['isActive'] = isActive

        const doctors = await this.prisma.doctor.findMany({
            where: query,
            select: doctorSelect,
        })

        if (!doctors) {
            throw new NotFoundException("Doctors not found")
        }

        let filteredDoctors = doctors.filter((doctor) => {

            const specialization = doctor.specialization?.toLowerCase() || "";
            const education = doctor.education?.toLowerCase() || "";
            const aboutMe = doctor.aboutMe?.toLowerCase() || "";
            const fullName = doctor.user?.fullName?.toLowerCase() || "";
            const email = doctor.user?.email?.toLowerCase() || "";
            const availableTimes = doctor.availableTimes?.map(time => time.toLowerCase()) || [];

            const matchedSearch = search
                ? specialization.includes(search) ||
                education.includes(search) ||
                aboutMe.includes(search) ||
                fullName.includes(search) ||
                email.includes(search) ||
                availableTimes.some(time => time.includes(search))
                : true;

            const matchedWeeks = weeks
                ? availableTimes.some(time => weeks.some(week => time.includes(week)))
                : true;

            return matchedSearch && matchedWeeks;
        })

        //sort doctors based on average rating
        const sortedDoctors = await this.modifyDoctors(filteredDoctors)

        const totalItems = sortedDoctors.length

        const paginatedDoctors = sortedDoctors.slice(skip, skip + limit)

        return {
            data: paginatedDoctors,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                itemsPerPage: limit
            },
            message: "Doctors fetched successfully"
        }
    }

    async getADoctor(doctor: any, queryParams: GetDoctorsDto) {

        const { page, limit } = queryParams

        const { id: doctorId } = doctor

        const skip = (page - 1) * limit

        const [reviews, totalReviews, averageRating, relatedDoctors, bookedAppointmentDates] = await this.prisma.$transaction([

            this.prisma.review.findMany({
                where: { doctorId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    patient: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            avatarImage: true
                        }
                    },
                    comment: true,
                    rating: true,
                    createdAt: true
                },
                skip: skip,
                take: limit
            }),

            this.prisma.review.count({ where: { doctorId } }),

            this.prisma.review.aggregate({
                where: { doctorId },
                _avg: { rating: true }
            }),

            this.prisma.doctor.findMany({
                where: {
                    specialization: doctor?.specialization,
                    isActive: true,
                    userId: {
                        not: doctorId,
                    }
                },
                take: 5,
                select: doctorSelect
            }),

            this.prisma.appointment.findMany({
                where: {
                    doctorId,
                    status: {
                        in: ["PENDING", "CONFIRMED"]
                    }
                },
                select: {
                    date: true
                },
            })
        ])

        //sort doctors based on average rating
        const sortedRelatedDoctors = await this.modifyDoctors(relatedDoctors)

        return {
            data: {
                doctor: {
                    ...doctor,
                    averageRating: averageRating._avg.rating,
                    totalReviews,
                    reviews
                },
                relatedDoctors: sortedRelatedDoctors,
                bookedAppointmentDates
            },
            pagination: {
                totalItems: totalReviews,
                totalPages: Math.ceil(totalReviews / limit),
                currentPage: page,
                itemsPerPage: limit
            },
            message: "Doctor fetched successfully"
        }
    }

    private async modifyDoctors(doctors: any[]) {

        const doctorsWithRating = await Promise.all(doctors.map(async (doctor) => {

            const [totalReviews, averageRating] = await this.prisma.$transaction([
                this.prisma.review.count({ where: { doctorId: doctor.userId } }),
                this.prisma.review.aggregate({
                    where: { doctorId: doctor.userId },
                    _avg: { rating: true },
                }),
            ]);

            return {
                ...doctor,
                totalReviews,
                averageRating: averageRating._avg.rating ? averageRating._avg.rating : 0,
            };
        }))

        const sortedDoctors = doctorsWithRating.sort((a, b) => {

            if (a.averageRating === b.averageRating) {
                return b.experience - a.experience;
            }

            else {
                return b.averageRating - a.averageRating
            }
        })

        return sortedDoctors
    }

    async getTotalRevenue(user: UserDto) {

        const { id } = user

        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: id },
            select: { revenue: true }
        })

        if (!doctor) {
            throw new NotFoundException("Doctor not found")
        }

        return {
            totalRevenue: doctor?.revenue,
            message: "Total revenue of doctor fetched successfully"
        }
    }

    async updateDoctor(data: Record<string, any>, traceId: string) {

        const { fullName, email, currentPassword, newPassword, phone, gender, birthDate, address, specialization, education, experience, aboutMe, fees, addAvailableTime, removeAvailableTime, isActive } = data.doctor

        const { userId: doctorId } = data

        let userData: any = null
        let doctorData: any = null

        if (fullName && email && phone && gender && birthDate && address && specialization && education && experience && aboutMe && fees) {
            userData = {
                fullName,
                email,
                phone,
                gender,
                birthDate,
                address
            }

            doctorData = {
                specialization,
                education,
                experience,
                aboutMe,
                fees
            }
        }

        else if (addAvailableTime) {
            doctorData = {
                availableTimes: {
                    push: addAvailableTime
                }
            }
        }

        else if (isActive !== undefined) doctorData = { isActive }

        if (currentPassword && newPassword) {

            const user = await this.prisma.user.findUnique({ where: { id: doctorId } })

            if (!user) {
                throw new NotFoundException("User not found")
            }

            const isMatched = await argon.verify(currentPassword, user?.password as string)

            if (!isMatched) {
                throw new BadRequestException("Current password is incorrect")
            }

            const hashedPassword = await argon.hash(newPassword)

            await this.prisma.user.update({
                where: { id: doctorId },
                data: {
                    password: hashedPassword
                }
            })

            return {
                message: "Password updated successfully"
            }
        }

        else if (removeAvailableTime) {

            const doctorRecord = await this.prisma.doctor.findUnique({ where: { userId: doctorId } })

            if (!doctorRecord) {
                throw new NotFoundException("Doctor not found")
            }

            const updatedAvailableTimes = doctorRecord?.availableTimes.filter((time: string) => time !== removeAvailableTime);

            doctorData = {
                availableTimes: {
                    set: updatedAvailableTimes
                }
            }
        }

        else if (userData) {

            // const existingUser = await this.fetchUserService.fetchUser(email)

            // if (existingUser && id !== existingUser.id) {
            //     this.handleErrorsService.throwBadRequestError("Email already exists")
            // }

            await this.prisma.user.update({
                where: { id: doctorId },
                data: userData
            })
        }

        const updatedDoctor = await this.prisma.doctor.update({
            where: { userId: doctorId },
            data: doctorData,
            select: {
                userId: true,
                specialization: true,
                education: true,
                experience: true,
                aboutMe: true,
                fees: true,
                availableTimes: true,
                isActive: true
            }
        })

        return {
            data: {
                fullName,
                email,
                phone,
                gender,
                birthDate,
                address,
                ...updatedDoctor
            },
            message: "Doctor updated successfully"
        }
    }

    async createStripeAccount(data: Record<string, any>, traceId: string) {

        const { doctor, userId } = data

        if (doctor.stripeAccountId) {
            throw new BadRequestException("Stripe account already exists")
        }

        const account = await this.stripe.accounts.create({
            type: 'express',
            email: doctor.user.email,
        });

        await this.prisma.doctor.update({
            where: { userId: doctor.user.id },
            data: { stripeAccountId: account.id }
        });

        const link = await this.stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${this.configService.get('FRONTEND_URL')}/stripe/onboarding/refresh`,
            return_url: `${this.configService.get('FRONTEND_URL')}/stripe/onboarding/return?accountId=${account.id}`,
            type: 'account_onboarding',
        });

        this.socketGateway.sendResponse(userId, {
            traceId,
            status: 'success',
            message: 'Stripe account created successfully',
            url: link.url,
        })
    }

    async activateStripeAccount(data: Record<string, any>, traceId: string) {

        const { userId: doctorId, stripeAccountId } = data

        const account = await this.stripe.accounts.retrieve(stripeAccountId);

        const {
            charges_enabled,
            payouts_enabled,
            details_submitted
        } = account

        if (charges_enabled && payouts_enabled && details_submitted) {

            await this.prisma.doctor.update({
                where: { userId: doctorId },
                data: { isStripeAccountActive: true }
            })
        }

        else {
            throw new BadRequestException("Stripe account not activated yet")
        }

        this.socketGateway.sendResponse(doctorId, {
            traceId,
            status: 'success',
            message: "Stripe account activated successfully"
        })
    }

    async deleteDoctor(data: Record<string, any>, traceId: string) {

        const { userId: doctorId } = data

        await this.prisma.doctor.delete({ where: { userId: doctorId } })

        this.socketGateway.sendResponse(doctorId, {
            traceId,
            status: 'success',
            message: "Doctor deleted successfully"
        })
    }
}
