import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from './dto';
import { appointmentSelect } from 'src/prisma/prisma-selects';
import { NotificationService } from 'src/notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AppointmentService {
    private readonly logger = new Logger(AppointmentService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
        private readonly config: ConfigService,
        private readonly email: EmailService,
        @InjectQueue('appointment-queue') private readonly appointmentQueue: Queue
    ) { }

    async createAppointment(dto: CreateAppointmentDto, traceId: string) {

        const { patientId, doctorId, date } = dto

        if (patientId === doctorId) {
            throw new BadRequestException("Patient and doctor cannot be the same")
        }

        if (date.getTime() < Date.now()) {
            throw new BadRequestException("Date must be in the future")
        }

        const existingAppointment = await this.prisma.appointment.findFirst({
            where: {
                OR: [
                    {
                        patientId,
                        date,
                        status: {
                            not: 'CANCELLED'
                        }
                    },
                    {
                        doctorId,
                        date,
                        status: {
                            not: 'CANCELLED'
                        }
                    }
                ]
            }
        });

        if (existingAppointment) {
            throw new BadRequestException("Appointment already booked")
        }

        const appointment = await this.prisma.appointment.create({
            data: { patientId, doctorId, date },
            select: appointmentSelect
        })

        const { patient: { fullName: patientName }, doctor: { fullName: doctorName } } = appointment as any

        this.logger.log(`📢 Sending notification to admin about new appointment with traceId: ${traceId}`);

        this.notificationService.sendNotifications(
            this.config.get('ADMIN_ID') as string,
            `${patientName}'s appointment with ${doctorName} is booked for ${date.toLocaleString()}.`,
            traceId
        )
            .catch((err) => {
                // it will throw an error if the job fails to be added in the queue
                this.logger.error(`❌ Failed to send notification: ${err.message} with traceId: ${traceId}`)

                this.email.alertAdmin(
                    'Failed to send notification about new appointment',
                    `Failed to send notification, Reason: ${err.message} with traceId: ${traceId}`
                )
            })

        return {
            data: appointment,
            message: "Appointment created successfully"
        }
    }

    async getAllAppointments(queryParam: GetAppointmentsDto) {
        const { page = 1, limit = 10, search, doctorId, patientId, status, isPaid, paymentMethod, isToday, isPast, isFuture } = queryParam

        const skip = (page - 1) * limit;
        let orderBy: any = { date: 'desc' }

        const query: any = doctorId ? { doctorId } : {}

        if (patientId) query.patientId = patientId

        if (status) {
            query.status = status

            if (status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'pending' || status.toLowerCase() === 'running') {
                orderBy = { date: 'asc' }
            }
        }

        if (isPaid !== undefined) query.isPaid = isPaid

        if (paymentMethod) query.paymentMethod = paymentMethod

        if (isToday) {
            const now = new Date();

            const start = new Date(Date.UTC( // converting to UTC time zone
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                0, 0, 0
            ));

            const end = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                23, 59, 59
            ));

            query.date = {
                gte: start,
                lte: end
            }

            orderBy = { date: 'asc' }
        }

        if (isPast) {
            const now = new Date()
            query.date = {
                lte: now
            }
        }

        if (isFuture) {
            const now = new Date()
            query.date = {
                gte: now
            }

            orderBy = { date: 'asc' }
        }

        if (search) {
            query.OR = [
                { cancellationReason: { contains: search, mode: 'insensitive' } },
                {
                    doctor: {
                        OR: [
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                },
                {
                    patient: {
                        OR: [
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                },
            ]
        }

        const [appointments, totalAppointments] = await this.prisma.$transaction([
            this.prisma.appointment.findMany({
                where: query,
                orderBy,
                select: appointmentSelect,
                take: limit,
                skip
            }),

            this.prisma.appointment.count({ where: query })
        ])

        return {
            data: appointments,
            pagination: {
                totalItems: totalAppointments,
                totalPages: Math.ceil(totalAppointments / limit),
                currentPage: page,
                itemsPerPage: limit
            },
        }
    }

    async getAllAppointmentCount(queryParam: GetAppointmentsDto) {

        const { doctorId, patientId } = queryParam

        const query: any = doctorId ? { doctorId } : {}

        if (patientId) query.patientId = patientId

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
            totalOnlinePaidAppointments
        ] = await this.prisma.$transaction([

            this.prisma.appointment.count({ where: { ...query } }),
            this.prisma.appointment.findMany({
                where: { ...query },
                distinct: 'patientId',
                select: { patientId: true }
            }),
            this.prisma.appointment.findMany({
                where: { ...query },
                distinct: "doctorId",
                select: { doctorId: true }
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
        ])

        return {
            data: {
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
                totalOnlinePaidAppointments
            },
            message: "Appointments count fetched successfully"
        }
    }

    async getTotalAppointmentsGraph(queryParam: GetAppointmentsDto) {

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
            data: result,
            message: "Appointments graph fetched successfully"
        };
    }

    async updateAppointment(dto: UpdateAppointmentDto, appointment: any, traceId: string) {

        const { status, isPaid, paymentMethod, cancellationReason } = dto

        const { id: appointmentId } = appointment

        const data: any = status ? { status } : {}

        // patient paid the appointment online
        if (isPaid && paymentMethod) {
            data.isPaid = isPaid
            data.paymentMethod = paymentMethod
        }

        const now = new Date();

        const { patient: { id: patientId, fullName: patientName }, doctor: { id: doctorId, fullName: doctorName }, date } = appointment as any

        if (status === "CONFIRMED") {

            const oneHourBefore = new Date(date.getTime() as number - 60 * 60 * 1000)

            this.logger.log(`📢 Sending notification to patient and doctor for appointment confirmation with traceId: ${traceId}`);

            try {
                // Send confirmation first (await to guarantee order)
                await Promise.all([

                    this.notificationService.sendNotifications(
                        patientId,
                        `Your appointment with ${doctorName} is confirmed for ${date.toLocaleString()}.`,
                        traceId
                    ),

                    this.notificationService.sendNotifications(
                        doctorId, 
                        `Your appointment with ${patientName} is confirmed for ${date.toLocaleString()}.`,
                        traceId
                    )
                ]);

                // Queue the delayed "1 hour before" notifications and appointment start in parallel
                await Promise.all([

                    this.notificationService.sendNotifications(
                        patientId, 
                        `Your appointment with ${doctorName} starts in 1 hour.`,
                        traceId,
                        oneHourBefore.getTime() - now.getTime()
                    ),

                    this.notificationService.sendNotifications(
                        doctorId, 
                        `Your appointment with ${patientName} starts in 1 hour.`,
                        traceId,
                        (oneHourBefore.getTime() - now.getTime())
                    ),

                    this.appointmentQueue.add(
                        "start-appointment",
                        { status: 'RUNNING', id: appointmentId },
                        {
                            delay: date.getTime() - now.getTime(),
                            attempts: 5,
                            removeOnComplete: true
                        }
                    )
                ]);
            }

            catch (error) {

            }
        }

        else if (status === 'CANCELLED') {
            data.cancellationReason = cancellationReason

            // send notification to patient
            this.notificationService.sendNotifications(
                patientId,
                `Your appointment with ${doctorName} is cancelled for ${date.toLocaleString()}. Reason: ${cancellationReason}`,
                traceId
            )
                .catch((error) => {
                    this.logger.error(`❌ Failed to insert notification into queue: ${error.message}`)
                })
        }

        else if (status === 'COMPLETED' && !appointment?.isPaid) {

            data.isPaid = true
            data.paymentMethod = 'CASH'
        }

        const updatedAppointment = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data,
            select: appointmentSelect
        })

        return {
            data: updatedAppointment,
            message: "Appointment updated successfully"
        }
    }
}
