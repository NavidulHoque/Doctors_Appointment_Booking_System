import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto, GetAppointmentExtraDto, GetAppointmentsDto, UpdateAppointmentDto } from './dto';
import { appointmentSelect } from 'src/prisma/prisma-selects';
import { NotificationService } from 'src/notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailService } from 'src/email/email.service';
import { Prisma, Role } from '@prisma/client';

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
    async getAllAppointments(queryParam: GetAppointmentsDto) {
        const {
            page = 1,
            limit = 10,
            search,
            doctorId,
            patientId,
            status,
            isPaid,
            paymentMethod,
            isToday,
            isPast,
            isFuture,
        } = queryParam;

        if ([isToday, isPast, isFuture].filter(Boolean).length > 1) {
            throw new BadRequestException('Only one of isToday, isPast, or isFuture can be passed as query parameter');
        }

        const skip = (page - 1) * limit;
        let orderBy: any = { date: 'desc' };

        const query: Prisma.AppointmentWhereInput = {};
        if (doctorId) query.doctorId = doctorId;
        if (patientId) query.patientId = patientId;
        if (isPaid !== undefined) query.isPaid = isPaid;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        if (status && status.length > 0) {
            query.status = { in: status };
            if (status.some((s) => ['CONFIRMED', 'PENDING', 'RUNNING'].includes(s))) {
                orderBy = { date: 'asc' };
            }
        }

        const now = new Date();

        if (isToday) {
            const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
            const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
            query.date = { gte: start, lte: end };
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

        const [appointments, totalAppointments] = await Promise.all([
            this.prisma.appointment.findMany({
                where: query,
                orderBy,
                select: appointmentSelect,
                take: limit,
                skip,
            }),
            this.prisma.appointment.count({ where: query }),
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
    async getAllAppointmentCount(queryParam: GetAppointmentExtraDto) {
        const { doctorId, patientId } = queryParam;
        const query: Prisma.AppointmentWhereInput = {};
        if (doctorId) query.doctorId = doctorId;
        if (patientId) query.patientId = patientId;

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
    async getTotalAppointmentsGraph(queryParam: GetAppointmentExtraDto) {

        const { doctorId, patientId } = queryParam;

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

        const result = rawResult.map((item: any) => ({
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
    ) {
        const { status, isPaid, paymentMethod, cancellationReason } = dto;
        const {
            id: appointmentId,
            patient: { id: patientId, fullName: patientName },
            doctor: { id: doctorId, fullName: doctorName },
            date,
        } = appointment;

        const appointmentDate = new Date(date);
        const formattedDate = appointmentDate.toISOString();

        const body: Record<string, any> = {};
        if (status) body.status = status;
        if (isPaid && paymentMethod) {
            body.isPaid = isPaid;
            body.paymentMethod = paymentMethod;
        }

        const now = new Date();

        /** CONFIRM */
        if (status === 'CONFIRMED') {
            const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000);

            await Promise.all([
                this.sendNotificationWithFallback(
                    patientId,
                    `Your appointment with ${doctorName} is confirmed for ${formattedDate}.`,
                    traceId,
                    { appointmentId },
                    'Failed to send appointment confirmation',
                ),
                this.sendNotificationWithFallback(
                    doctorId,
                    `Your appointment with ${patientName} is confirmed for ${formattedDate}.`,
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
                        delay: appointmentDate.getTime() - now.getTime(),
                        backoff: { type: 'exponential', delay: 5000 },
                        attempts: 5,
                        removeOnComplete: true,
                        removeOnFail: false,
                    },
                ),
            ]);
        }

        /** CANCEL */
        if (status === 'CANCELLED') {
            body.cancellationReason = cancellationReason;
            this.sendNotificationWithFallback(
                patientId,
                `Your appointment with ${doctorName} was cancelled for ${formattedDate}. Reason: ${cancellationReason}`,
                traceId,
                { appointmentId },
                'Failed to send appointment cancellation',
            );
        }

        /** COMPLETE → auto mark paid */
        if (status === 'COMPLETED' && !appointment.isPaid) {
            body.isPaid = true;
            body.paymentMethod = 'CASH';
        }

        const updatedAppointment = await this.prisma.appointment.update({
            where: { id: appointmentId },
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

