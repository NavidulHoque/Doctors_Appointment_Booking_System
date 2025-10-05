import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateDoctorDto, DoctorResponseDto, GetDoctorsDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { doctorSelect } from 'src/prisma/prisma-selects';
import * as argon from "argon2";
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { SocketGateway } from 'src/socket/socket.gateway';
import { PaginationDto } from 'src/common/dto';
import { Status } from '@prisma/client';
import { PaginationResponseDto } from 'src/common/dto';

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

    /** ----------------------
     * CREATE
     * ---------------------- */
    async createDoctor(dto: CreateDoctorDto) {

        const { fullName, email, password, specialization, education, experience, aboutMe, fees, availableTimes } = dto
        try {
            const hashedPassword = await argon.hash(password);

            const result = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: { fullName, email, password: hashedPassword, role: 'DOCTOR' },
                });

                const doctor = await tx.doctor.create({
                    data: {
                        userId: user.id,
                        specialization,
                        education,
                        experience,
                        aboutMe,
                        fees,
                        availableTimes
                    },
                    select: doctorSelect
                });

                const doctorResponse = new DoctorResponseDto(doctor)

                return doctorResponse;
            });

            return {
                doctor: result,
                message: 'Doctor created successfully',
            };
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

    /** ----------------------
     * GET ALL
     * ---------------------- */
    async getAllDoctors(queryParams: GetDoctorsDto) {
        const { page, limit, search, specialization, experience, fees, weeks, isActive } = queryParams;

        const query = this.buildDoctorQuery({ specialization, experience, fees, isActive });

        const doctors = await this.prisma.doctor.findMany({
            where: query,
            select: doctorSelect,
        });

        if (!doctors.length) {
            throw new NotFoundException("Doctors not found");
        }

        const filteredDoctors = this.filterDoctors(doctors, { search, weeks });

        const sortedDoctors = await this.sortDoctors(filteredDoctors);

        const { paginatedItems, meta } = this.paginate(sortedDoctors, page, limit);

        const doctorResponses = paginatedItems.map((doctor) => new DoctorResponseDto(doctor));

        return {
            doctors: doctorResponses,
            pagination: meta,
            message: "Doctors fetched successfully",
        };
    }

    /** ----------------------
     * GET A DOCTOR
     * ---------------------- */
    async getADoctor(doctor: Record<string, any>, queryParams: PaginationDto) {
        const { page = 1, limit = 10 } = queryParams;
        const skip = (page - 1) * limit;
        const { id: doctorId } = doctor;

        const [reviews, totalReviews, averageRating, relatedDoctors, bookedAppointmentDates] =
            await Promise.all([
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
                                avatarImage: true,
                            },
                        },
                        comment: true,
                        rating: true,
                        createdAt: true,
                    },
                    skip,
                    take: limit
                }),

                this.prisma.review.count({ where: { doctorId } }),

                this.prisma.review.aggregate({
                    where: { doctorId },
                    _avg: { rating: true },
                }),

                this.prisma.doctor.findMany({
                    where: {
                        specialization: doctor.specialization,
                        isActive: true,
                        userId: { not: doctorId },
                    },
                    take: 5,
                    select: doctorSelect,
                }),

                this.prisma.appointment.findMany({
                    where: {
                        doctorId,
                        status: { in: [Status.PENDING, Status.CONFIRMED] },
                    },
                    select: { date: true },
                })
            ]);

        const sortedRelatedDoctors = await this.sortDoctors(relatedDoctors);

        const doctorResponse = new DoctorResponseDto(doctor);

        const relatedDoctorResponses = sortedRelatedDoctors.map((doctor) => new DoctorResponseDto(doctor));

        return {
            doctor: {
                ...doctorResponse,
                averageRating: averageRating._avg.rating || 0,
                totalReviews,
                reviews,
            },
            relatedDoctors: relatedDoctorResponses,
            bookedAppointmentDates,
            pagination: new PaginationResponseDto(totalReviews, page, limit),
            message: "Doctor fetched successfully",
        };
    }

    async updateDoctor(data: Record<string, any>, traceId: string) {

        const { fullName, email, currentPassword, newPassword, phone, gender, birthDate, address, specialization, education, experience, aboutMe, fees, addAvailableTime, removeAvailableTime, isActive } = data.doctor

        const { userId, doctorId } = data

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

        if (addAvailableTime) {
            doctorData = {
                availableTimes: {
                    push: addAvailableTime
                }
            }
        }

        if (isActive !== undefined) doctorData = { isActive }

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

        if (removeAvailableTime) {

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

        if (userData) {

            const existingUser = await this.prisma.user.findUnique({
                where: { email }
            })

            if (existingUser && doctorId !== existingUser.id) {
                throw new BadRequestException("Email already exists")
            }

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

        this.socketGateway.sendResponse(userId, {
            traceId,
            status: 'success',
            message: "Doctor updated successfully",
            data: {
                fullName,
                email,
                phone,
                gender,
                birthDate,
                address,
                ...updatedDoctor
            },
        });
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

        const { userId: adminId, doctorId } = data

        await this.prisma.doctor.delete({ where: { userId: doctorId } })

        this.socketGateway.sendResponse(adminId, {
            traceId,
            status: 'success',
            message: "Doctor deleted successfully"
        })
    }

    /** ----------------------
     * HELPERS
     * ---------------------- */
    private async sortDoctors(doctors: any[]) {

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

    private buildDoctorQuery({ specialization, experience, fees, isActive }: any) {
        const query: Record<string, any> = {};

        if (specialization) {
            query.specialization = { contains: specialization, mode: 'insensitive' };
        }

        if (experience?.length === 1) {
            query.experience = { gte: experience[0] };
        } else if (experience?.length === 2) {
            query.experience = { gte: experience[0], lte: experience[1] };
        }

        if (fees?.length === 1) {
            query.fees = { lte: fees[0] };
        } else if (fees?.length === 2) {
            query.fees = { gte: fees[0], lte: fees[1] };
        }

        if (isActive !== undefined) {
            query.isActive = isActive;
        }

        return query;
    }

    private filterDoctors(doctors: any[], { search, weeks }: { search?: string; weeks?: string[] }) {
        return doctors.filter((doctor) => {
            const specialization = doctor.specialization?.toLowerCase() || "";
            const education = doctor.education?.toLowerCase() || "";
            const aboutMe = doctor.aboutMe?.toLowerCase() || "";
            const fullName = doctor.user?.fullName?.toLowerCase() || "";
            const email = doctor.user?.email?.toLowerCase() || "";
            const availableTimes = doctor.availableTimes?.map((time) => time.toLowerCase()) || [];

            const matchedSearch = search
                ? specialization.includes(search) ||
                education.includes(search) ||
                aboutMe.includes(search) ||
                fullName.includes(search) ||
                email.includes(search) ||
                availableTimes.some((time) => time.includes(search))
                : true;

            const matchedWeeks = weeks
                ? availableTimes.some((time) => weeks.some((week) => time.includes(week)))
                : true;

            return matchedSearch && matchedWeeks;
        });
    }

    private paginate(items: any[], page: number, limit: number) {
        const totalItems = items.length;
        const skip = (page - 1) * limit;

        return {
            paginatedItems: items.slice(skip, skip + limit),
            meta: new PaginationResponseDto(totalItems, page, limit),
        };
    }
}
