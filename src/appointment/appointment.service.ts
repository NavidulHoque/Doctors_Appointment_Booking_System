import { Injectable } from '@nestjs/common';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from './dto';
import { appointmentSelect } from 'src/prisma/prisma-selects';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AppointmentService {

    constructor(
        private prisma: PrismaService,
        private handleErrorsService: HandleErrorsService,
        private notificationService: NotificationService
    ) { }

    async createAppointment(dto: CreateAppointmentDto) {

        const { patientId, doctorId, date } = dto

        if (patientId === doctorId) {
            this.handleErrorsService.throwBadRequestError("Patient and doctor cannot be the same")
        }

        if (date.getTime() < Date.now()) {
            this.handleErrorsService.throwBadRequestError("Date must be in the future")
        }

        try {
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

            if (existingAppointment) this.handleErrorsService.throwBadRequestError("Appointment already booked")

            const appointment = await this.prisma.appointment.create({ data: { patientId, doctorId, date } })

            return {
                data: appointment,
                message: "Appointment created successfully"
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
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

        try {
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

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }

    async getAllAppointmentCount(queryParam: GetAppointmentsDto) {

        const { doctorId, patientId } = queryParam

        const query: any = doctorId ? { doctorId } : {}

        if (patientId) query.patientId = patientId

        try {
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

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }

    async getAnAppointment(id: string) {

        try {

            const appointment = await this.prisma.appointment.findUnique({
                where: { id },
                select: appointmentSelect
            })

            if (!appointment) {
                this.handleErrorsService.throwNotFoundError("Appointment not found")
            }

            return {
                data: appointment,
                message: "Appointment fetched successfully"
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
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

        try {
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

        catch (error) {
            this.handleErrorsService.handleError(error);
        }
    }


    async updateAppointment(dto: UpdateAppointmentDto, id: string) {

        const { status, isPaid, paymentMethod, cancellationReason } = dto

        const data: any = status ? { status } : {}

        try {
            const appointment = await this.prisma.appointment.findUnique({
                where: { id },
                select: appointmentSelect
            })

            if (!appointment) {
                this.handleErrorsService.throwNotFoundError("Appointment not found")
            }

            const now = new Date();

            const { patient: { id: patientId, fullName: patientName }, doctor: { id: doctorId, fullName: doctorName }, date } = appointment as any

            if (status === "CONFIRMED") {

                const oneHourBefore = new Date(date.getTime() as number - 60 * 60 * 1000)

                // Add jobs to queue

                // send notifications to patient
                await this.notificationService.sendNotifications(patientId, `Your appointment with ${doctorName} is confirmed for ${date.toLocaleString()}.`)

                await this.notificationService.sendNotifications(patientId, `Your appointment with ${doctorName} starts in 1 hour.`, oneHourBefore.getTime() - now.getTime());

                // send notifications to doctor
                await this.notificationService.sendNotifications(doctorId, `Your appointment with ${patientName} is confirmed for ${date.toLocaleString()}.`)

                await this.notificationService.sendNotifications(doctorId, `Your appointment with ${patientName} starts in 1 hour.`, oneHourBefore.getTime() - now.getTime());
            }

            else if (status === 'CANCELLED') {
                data.cancellationReason = cancellationReason

                // send notifications to patient
                await this.notificationService.sendNotifications(patientId, `Your appointment with ${doctorName} is cancelled for ${date.toLocaleString()}. Reason: ${cancellationReason}`)
            }

            else if (status === 'COMPLETED') {

                if (!appointment?.isPaid) {
                    data.isPaid = true
                    data.paymentMethod = 'CASH'
                }

                //send notifications to patient
                await this.notificationService.sendNotifications(patientId, `Your appointment with ${doctorName} is completed for ${date.toLocaleString()}.`)

                //send notifications to doctor
                await this.notificationService.sendNotifications(doctorId, `Your appointment with ${patientName} is completed for ${date.toLocaleString()}.`)
            }

            // patient paid the appointment online
            if (isPaid && paymentMethod) {
                data.isPaid = isPaid
                data.paymentMethod = paymentMethod

                // send notifications to patient
                await this.notificationService.sendNotifications(patientId, `Your appointment with ${doctorName} is paid using stripe.`)
            }

            const updatedAppointment = await this.prisma.appointment.update({
                where: { id },
                data,
                select: appointmentSelect
            })

            return {
                data: updatedAppointment,
                message: "Appointment updated successfully"
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }
}
