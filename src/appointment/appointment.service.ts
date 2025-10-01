import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from './dto';
import { appointmentSelect } from 'src/prisma/prisma-selects';
import { NotificationService } from 'src/notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailService } from 'src/email/email.service';
import { Prisma, Role } from '@prisma/client';
import { DateTime } from 'luxon';
import { UserDto } from 'src/user/dto';

@Injectable()
export class AppointmentService {
    private readonly logger = new Logger(AppointmentService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
        private readonly email: EmailService,
        private readonly config: ConfigService,
        @InjectQueue('appointment-queue') private readonly appointmentQueue: Queue
    ) { }

    /** ----------------------
    * CREATE
    * ---------------------- */
    async createAppointment(dto: CreateAppointmentDto, traceId: string) {
        try {
            const { patientId, doctorId, date } = dto;

            if (!patientId) {
                throw new BadRequestException('Patient ID is required');
            }

            const [patient, doctor] = await Promise.all([
                this.prisma.user.findUnique({ where: { id: patientId }, select: { role: true } }),
                this.prisma.user.findUnique({ where: { id: doctorId }, select: { role: true } })
            ]);

            if (!patient || !doctor) {
                throw new BadRequestException('Patient or Doctor not found');
            }

            else if (patient.role !== Role.PATIENT || doctor.role !== Role.DOCTOR) {
                throw new BadRequestException('Invalid roles: ensure patient is a PATIENT and doctor is a DOCTOR');
            }

            const appointment = await this.prisma.appointment.create({
                data: { patientId: patientId!, doctorId, date },
                select: appointmentSelect,
            });

            const {
                patient: { fullName: patientName },
                doctor: { fullName: doctorName },
            } = appointment;

            this.logger.log(
                `📢 Sending notification to admin about new appointment with traceId: ${traceId}`,
            );

            this.sendNotificationWithFallback(
                this.config.get('ADMIN_ID') as string,
                `${patientName}'s appointment with ${doctorName} is booked for ${date}.`,
                traceId,
                { appointmentId: appointment.id },
                'Failed to send notification about new appointment',
            );

            return {
                appointment,
                message: 'Appointment created successfully',
            };
        }

        catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException("Appointment already booked");
            }
            throw error;
        }
    }

    /** ----------------------
    * GET ALL
    * ---------------------- */
    async getAllAppointments(dto: GetAppointmentsDto, user: UserDto) {
        const { page, limit } = dto;

        const skip = (page - 1) * limit;
        const { query: where, orderBy } = this.buildAppointmentQuery(dto, user);

        const [appointments, totalAppointments] = await Promise.all([
            this.prisma.appointment.findMany({
                where,
                orderBy,
                select: appointmentSelect,
                take: limit,
                skip,
            }),
            this.prisma.appointment.count({ where }),
        ]);

        return {
            appointments,
            pagination: {
                totalItems: totalAppointments,
                totalPages: Math.ceil(totalAppointments / limit),
                currentPage: page,
                itemsPerPage: limit,
            },
        };
    }

    /** ----------------------
    * GET COUNTS
    * ---------------------- */
    async getAllAppointmentCount(user: UserDto) {
        const query = this.applyRoleBasedScope(user, {});

        const [
            totalAppointments,
            uniquePatients,
            uniqueDoctors,
            totalPendingAppointments,
            totalConfirmedAppointments,
            totalRunningAppointments,
            totalCompletedAppointments,
            totalCancelledAppointments,
            totalPaidAppointments,
            totalUnPaidAppointments,
            totalCashPaidAppointments,
            totalOnlinePaidAppointments,
        ] = await Promise.all([
            this.prisma.appointment.count({ where: query }),
            this.prisma.appointment.findMany({
                where: query,
                distinct: 'patientId',
                select: { patientId: true },
            }),
            this.prisma.appointment.findMany({
                where: query,
                distinct: 'doctorId',
                select: { doctorId: true },
            }),
            this.prisma.appointment.count({ where: { ...query, status: 'PENDING' } }),
            this.prisma.appointment.count({ where: { ...query, status: 'CONFIRMED' } }),
            this.prisma.appointment.count({ where: { ...query, status: 'RUNNING' } }),
            this.prisma.appointment.count({ where: { ...query, status: 'COMPLETED' } }),
            this.prisma.appointment.count({ where: { ...query, status: 'CANCELLED' } }),
            this.prisma.appointment.count({ where: { ...query, isPaid: true } }),
            this.prisma.appointment.count({ where: { ...query, isPaid: false } }),
            this.prisma.appointment.count({ where: { ...query, paymentMethod: 'CASH' } }),
            this.prisma.appointment.count({ where: { ...query, paymentMethod: 'ONLINE' } }),
        ]);

        return {
            counts: {
                totalAppointments,
                totalUniquePatientsCount: uniquePatients.length,
                totalUniqueDoctorsCount: uniqueDoctors.length,
                totalPendingAppointments,
                totalConfirmedAppointments,
                totalRunningAppointments,
                totalCompletedAppointments,
                totalCancelledAppointments,
                totalPaidAppointments,
                totalUnPaidAppointments,
                totalCashPaidAppointments,
                totalOnlinePaidAppointments,
            },
            message: 'Appointments count fetched successfully',
        };
    }

    /** ----------------------
    * GET GRAPH
    * ---------------------- */
    async getTotalAppointmentsGraph(user: UserDto) {

        const { doctorId, patientId } = this.applyRoleBasedScope(user, {});

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
        ]

        let whereClause = '';
        const values: any[] = [];

        if (doctorId) {
            whereClause = `WHERE "doctorId" = $1`;
            values.push(doctorId);
        }

        else if (patientId) {
            whereClause = `WHERE "patientId" = $1`;
            values.push(patientId);
        }

        const query = `
                SELECT 
                    EXTRACT(YEAR FROM "date") AS year,
                    EXTRACT(MONTH FROM "date") AS month,
                    COUNT(*) AS total
                FROM "Appointment"
                ${whereClause}
                GROUP BY year, month
                ORDER BY year, month;
                `;

        const rawResult: any[] = values.length > 0
            ? await this.prisma.$queryRawUnsafe(query, ...values)
            : await this.prisma.$queryRawUnsafe(query);

        const result = rawResult.map((item: Record<string, any>) => ({
            year: Number(item.year),
            month: months[Number(item.month) - 1],
            total: Number(item.total),
        }));

        return {
            result,
            message: "Appointments graph fetched successfully"
        };
    }

    /** ----------------------
    * UPDATE
    * ---------------------- */
    async updateAppointment(
        dto: UpdateAppointmentDto,
        traceId: string,
        appointment: Record<string, any>,
        userRole = ""
    ) {
        const body = await this.prepareAppointmentUpdate(dto, appointment, traceId, userRole);

        const updatedAppointment = await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: body,
            select: appointmentSelect,
        });

        return {
            message: 'Appointment updated successfully',
            appointment: updatedAppointment,
        };
    }

    /** ----------------------
     * HELPERS
     * ---------------------- */
    private async prepareAppointmentUpdate(
        dto: UpdateAppointmentDto,
        appointment: Record<string, any>,
        traceId: string,
        userRole: string
    ) {
        const { status, cancellationReason } = dto;

        const {
            id: appointmentId,
            patient: { id: patientId, fullName: patientName },
            doctor: { id: doctorId, fullName: doctorName },
            date,
        } = appointment;

        const body: Record<string, any> = {};
        if (status) body.status = status;

        const now = new Date();

        switch (status) {

            case 'CONFIRMED': {

                if (Role.ADMIN === userRole) {
                    const oneHourBefore = new Date(date.getTime() - 60 * 60 * 1000);

                    await Promise.all([
                        this.sendNotificationWithFallback(
                            patientId,
                            `Your appointment with ${doctorName} is confirmed for ${date.toString()}.`,
                            traceId,
                            { appointmentId },
                            'Failed to send appointment confirmation',
                        ),
                        this.sendNotificationWithFallback(
                            doctorId,
                            `Your appointment with ${patientName} is confirmed for ${date.toString()}.`,
                            traceId,
                            { appointmentId },
                            'Failed to send appointment confirmation',
                        ),
                    ]);

                    await Promise.all([
                        this.sendNotificationWithFallback(
                            patientId,
                            `Your appointment with ${doctorName} starts in 1 hour.`,
                            traceId,
                            { appointmentId },
                            'Failed to send appointment reminder',
                            oneHourBefore.getTime() - now.getTime(),
                        ),
                        this.sendNotificationWithFallback(
                            doctorId,
                            `Your appointment with ${patientName} starts in 1 hour.`,
                            traceId,
                            { appointmentId },
                            'Failed to send appointment reminder',
                            oneHourBefore.getTime() - now.getTime(),
                        ),
                        this.appointmentQueue.add(
                            'start-appointment',
                            { status: 'RUNNING', appointment, traceId },
                            {
                                delay: date.getTime() - now.getTime(),
                                backoff: { type: 'exponential', delay: 5000 },
                                attempts: 5,
                                removeOnComplete: true,
                                removeOnFail: false,
                            },
                        ),
                    ]);
                }

                else {
                    throw new ForbiddenException("Only admin can confirm appointments");
                }

                break
            }

            case 'CANCELLED': {
                body.cancellationReason = cancellationReason;

                this.sendNotificationWithFallback(
                    patientId,
                    `Your appointment with ${doctorName} was cancelled on ${date.toString()}. Reason: ${cancellationReason}`,
                    traceId,
                    { appointmentId },
                    'Failed to send appointment cancellation',
                );
                break;
            }

            case 'COMPLETED': {
                if (Role.ADMIN === userRole) {

                    if (!appointment.isPaid) {
                        body.isPaid = true;
                        body.paymentMethod = 'CASH';
                    }
                }

                else {
                    throw new ForbiddenException("Only admin can complete appointments");
                }

                break;
            }

            default:
                break;
        }

        return body;
    }

    private buildAppointmentQuery(dto: GetAppointmentsDto, user: UserDto) {
        const {
            search, status, isPaid,
            paymentMethod, isToday, isPast, isFuture,
        } = dto;

        const query = this.applyRoleBasedScope(user, {});

        if ([isToday, isPast, isFuture].filter(Boolean).length > 1) {
            throw new BadRequestException('Only one of isToday, isPast, or isFuture can be passed');
        }

        let orderBy: any = { date: 'desc' };
        const now = new Date();

        if (isPaid !== undefined) query.isPaid = isPaid;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        if (status && status.length > 0) {
            query.status = { in: status };
            if (status.some((s) => ['CONFIRMED', 'PENDING', 'RUNNING'].includes(s))) {
                orderBy = { date: 'asc' };
            }
        }

        if (isToday) {
            const localTime = DateTime.fromJSDate(new Date(), { zone: 'Asia/Dhaka' });
            const startUTC = localTime.startOf('day').toUTC().toJSDate();
            const endUTC = localTime.endOf('day').toUTC().toJSDate();

            query.date = { gte: startUTC, lte: endUTC };
            orderBy = { date: 'asc' };
        }

        if (isPast) query.date = { lte: now };

        if (isFuture) {
            query.date = { gte: now };
            orderBy = { date: 'asc' };
        }

        if (search) {
            query.OR = [
                { cancellationReason: { contains: search, mode: 'insensitive' } },
                {
                    doctor: {
                        OR: [
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    patient: {
                        OR: [
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }

        return { query, orderBy };
    }

    private applyRoleBasedScope(user: UserDto, query: Prisma.AppointmentWhereInput) {
        switch (user.role) {

            case Role.PATIENT:
                query.patientId = user.id;
                break;

            case Role.DOCTOR:
                query.doctorId = user.id;
                break;
        }

        return query
    }

    private async sendNotificationWithFallback(
        userId: string,
        message: string,
        traceId: string,
        meta: Record<string, any>,
        alertSubject: string,
        delay = 0,
    ) {
        try {
            await this.notificationService.sendNotifications(
                userId,
                message,
                traceId,
                delay,
                meta,
            );
        }

        catch (error) {
            this.logger.error(
                `❌ Failed to insert notification into queue, Reason: ${error.message}, traceId=${traceId}`,
            );

            try {
                await this.email.alertAdmin(
                    alertSubject,
                    `${alertSubject}<br>
                     Reason: ${error.message}<br>
                     traceId: ${traceId}`,
                );
            }

            catch (emailError) {
                this.logger.error(
                    `❌ Failed to send alert email, Reason: ${emailError.message}, traceId=${traceId}`,
                );
            }
        }
    }
}

