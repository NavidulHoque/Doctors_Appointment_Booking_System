import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetAppointmentsDto } from './dto';
import { appointmentSelect } from 'src/prisma/prisma-selects';
import { NotificationService } from 'src/notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailService } from 'src/email/email.service';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class AppointmentService {
    private readonly logger = new Logger(AppointmentService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
        private readonly email: EmailService,
        private readonly socketGateway: SocketGateway,
        private readonly config: ConfigService,
        @InjectQueue('appointment-queue') private readonly appointmentQueue: Queue
    ) { }

    async createAppointment(data: Record<string, any>, traceId: string) {
        const { patientId, doctorId, date, userId } = data;

        const appointmentDate = new Date(date);

        const [patient, doctor] = await this.prisma.$transaction([
            this.prisma.user.findUnique({
                where: { id: patientId },
                select: { role: true }
            }),
            this.prisma.user.findUnique({
                where: { id: doctorId },
                select: { role: true }
            })
        ]);

        if (patient!.role !== 'PATIENT' || doctor!.role !== 'DOCTOR') {
            throw new BadRequestException(
                'Requested patient is not patient or requested doctor is not doctor',
            );
        }

        if (appointmentDate.getTime() < Date.now()) {
            throw new BadRequestException('Date must be in the future');
        }

        const existingAppointment = await this.prisma.appointment.findFirst({
            where: {
                OR: [
                    {
                        patientId,
                        date: appointmentDate,
                        status: { not: 'CANCELLED' },
                    },
                    {
                        doctorId,
                        date: appointmentDate,
                        status: { not: 'CANCELLED' },
                    },
                ],
            },
        });

        if (existingAppointment) {
            throw new BadRequestException('Appointment already booked');
        }

        this.logger.log(`✉️ Creating appointment with traceId ${traceId}`);

        const appointment = await this.prisma.appointment.create({
            data: { patientId, doctorId, date: appointmentDate },
            select: appointmentSelect,
        });

        this.logger.log(`✅ Created Appointment with traceId ${traceId}`);

        const {
            patient: { fullName: patientName },
            doctor: { fullName: doctorName },
        } = appointment;

        this.logger.log(
            `📢 Sending notification to admin about new appointment with traceId: ${traceId}`,
        );

        this.notificationService
            .sendNotifications(
                this.config.get('ADMIN_ID') as string,
                `${patientName}'s appointment with ${doctorName} is booked for ${appointmentDate.toLocaleString()}.`,
                traceId,
                0,
                { appointmentId: appointment.id },
            )
            .catch((error) => {
                this.logger.error(this.generateNotificationErrorMessage(error.message, traceId));

                this.email
                    .alertAdmin(
                        'Failed to send notification',
                        `Failed to send notification about new appointment,<br>
                         Reason: ${error.message} with traceId: ${traceId},<br>
                         appointmentId: ${appointment.id}`,
                    )
                    .catch((error) => {
                        this.logger.error(this.generateAdminAlertErrorMessage(error.message, traceId));
                    });
            });

        this.socketGateway.sendResponse(userId, {
            traceId,
            status: 'success',
            message: 'Appointment created successfully',
            data: appointment,
        });
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

    async updateAppointment(data: Record<string, any>, traceId: string) {

        const { status, isPaid, paymentMethod, cancellationReason, userId, appointment } = data

        const { id: appointmentId, patient: { id: patientId, fullName: patientName }, doctor: { id: doctorId, fullName: doctorName }, date } = appointment

        const appointmentDate = new Date(date);
        const formattedDate = appointmentDate.toLocaleString()
        const body: Record<string, any> = status ? { status } : {}

        // patient paid the appointment online
        if (isPaid && paymentMethod) {
            body.isPaid = isPaid
            body.paymentMethod = paymentMethod
        }

        const now = new Date();

        if (status === "CONFIRMED") {

            const oneHourBefore = new Date(appointmentDate.getTime() - 60 * 60 * 1000)

            this.logger.log(`📢 Sending notification to patient and doctor for appointment confirmation with traceId: ${traceId}`);

            // Send confirmation first (await to guarantee order)
            await Promise.all([

                this.notificationService.sendNotifications(
                    patientId,
                    `Your appointment with ${doctorName} is confirmed for ${formattedDate}.`,
                    traceId,
                    0,
                    { appointmentId }
                )
                    .catch((error) => {
                        this.logger.error(this.generateNotificationErrorMessage(error.message, traceId))

                        this.email.alertAdmin(
                            'Failed to send notification',
                            `Failed to send notification about appointment confirmation to, <br>
                             ${patientName} of appointmentId=${appointmentId} for ${formattedDate} of ${doctorName},<br>
                             Reason: ${error.message} with traceId: ${traceId}`
                        )
                            .catch((error) => {
                                this.logger.error(this.generateAdminAlertErrorMessage(error.message, traceId))
                            })
                    }),

                this.notificationService.sendNotifications(
                    doctorId,
                    `Your appointment with ${patientName} is confirmed for ${formattedDate}.`,
                    traceId,
                    0,
                    { appointmentId }
                )
                    .catch((error) => {
                        this.logger.error(this.generateNotificationErrorMessage(error.message, traceId))

                        this.email.alertAdmin(
                            'Failed to send notification',
                            `Failed to send notification about appointment confirmation to,<br>
                             ${doctorName} of appointmentId=${appointmentId} for ${formattedDate} with ${patientName},<br>
                             Reason: ${error.message} with traceId: ${traceId}`
                        )
                            .catch((error) => {
                                this.logger.error(this.generateAdminAlertErrorMessage(error.message, traceId))
                            })
                    })
            ]);

            // Queue the delayed "1 hour before" notifications and appointment start in parallel
            await Promise.all([

                this.notificationService.sendNotifications(
                    patientId,
                    `Your appointment with ${doctorName} starts in 1 hour.`,
                    traceId,
                    oneHourBefore.getTime() - now.getTime(),
                    { appointmentId }
                )
                    .catch((error) => {
                        this.logger.error(this.generateNotificationErrorMessage(error.message, traceId))

                        this.email.alertAdmin(
                            'Failed to send notification',
                            `Failed to send notification about appointment reminder to,<br>
                             ${patientName} of appointmentId=${appointmentId} for ${formattedDate} of ${doctorName},<br>
                             Reason: ${error.message} with traceId: ${traceId}`
                        )
                            .catch((error) => {
                                this.logger.error(this.generateAdminAlertErrorMessage(error.message, traceId))
                            })
                    }),

                this.notificationService.sendNotifications(
                    doctorId,
                    `Your appointment with ${patientName} starts in 1 hour.`,
                    traceId,
                    (oneHourBefore.getTime() - now.getTime()),
                    { appointmentId }
                )
                    .catch((error) => {
                        this.logger.error(this.generateNotificationErrorMessage(error.message, traceId))

                        this.email.alertAdmin(
                            'Failed to send notification',
                            `Failed to send notification about appointment reminder to,<br>
                             ${doctorName} of appointmentId=${appointmentId} for ${formattedDate} with ${patientName},<br>
                             Reason: ${error.message} with traceId: ${traceId}`
                        )
                            .catch((error) => {
                                this.logger.error(this.generateAdminAlertErrorMessage(error.message, traceId))
                            })
                    }),

                this.appointmentQueue.add(
                    "start-appointment",
                    { status: 'RUNNING', appointment, traceId },
                    {
                        delay: appointmentDate.getTime() - now.getTime(),
                        backoff: { type: 'exponential', delay: 5000 },
                        attempts: 5,
                        removeOnComplete: true,
                        removeOnFail: false
                    }
                )
                    .catch((error) => {
                        this.logger.error(
                            `❌ Failed to insert start-appointment job into queue, Reason: ${error.message} with traceId: ${traceId}`
                        )

                        this.email.alertAdmin(
                            'Failed to start appointment',
                            `Failed to start,
                            "appointment: id=${appointmentId}, status=RUNNING for ${formattedDate}",
                            Reason: ${error.message} with traceId: ${traceId}`
                        )
                            .catch((error) => {
                                this.logger.error(this.generateAdminAlertErrorMessage(error.message, traceId))
                            })
                    })
            ]);
        }

        else if (status === 'CANCELLED') {
            body.cancellationReason = cancellationReason

            // send notification to patient
            this.notificationService.sendNotifications(
                patientId,
                `Your appointment with ${doctorName} is cancelled for ${formattedDate}. Reason: ${cancellationReason}`,
                traceId,
                0,
                { appointmentId }
            )
                .catch((error) => {
                    this.logger.error(this.generateNotificationErrorMessage(error.message, traceId))

                    this.email.alertAdmin(
                        'Failed to send notification',
                        `Failed to send notification about appointment cancellation to,<br>
                         ${patientName} of appointmentId=${appointmentId} for ${formattedDate},<br>
                         of ${doctorName},<br>
                         Cancellation reason: ${cancellationReason},<br>
                         Error reason: ${error.message} with traceId: ${traceId}`
                    )
                        .catch((error) => {
                            this.logger.error(this.generateAdminAlertErrorMessage(error.message, traceId))
                        })
                })
        }

        else if (status === 'COMPLETED' && !appointment.isPaid) {

            body.isPaid = true
            body.paymentMethod = 'CASH'
        }

        this.logger.log(`✉️ Updating appointment with traceId ${traceId}`);

        const updatedAppointment = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: body,
            select: appointmentSelect
        })

        this.logger.log(`✅ Updated Appointment with traceId ${traceId}`);

        this.socketGateway.sendResponse(userId, {
            traceId,
            status: 'success',
            message: "Appointment updated successfully",
            data: updatedAppointment
        });
    }

    private generateNotificationErrorMessage(message: string, traceId: string) {
        return `❌ Failed to insert notification into queue, Reason: ${message} with traceId: ${traceId}`
    }

    private generateAdminAlertErrorMessage(message: string, traceId: string) {
        return `❌ Failed to send alert email to admin, Reason: ${message} with traceId: ${traceId}`
    }
}
