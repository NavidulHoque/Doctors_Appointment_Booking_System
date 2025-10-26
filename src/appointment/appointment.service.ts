import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { AppointmentCountResponseDto, AppointmentResponseDto, CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from './dtos';
import { appointmentSelect } from './prisma-selects';
import { Method, Role, Status } from '@prisma/client';
import { UserDto } from 'src/user/dtos';
import { PaginationResponseDto } from 'src/common/dtos';
import { AppointmentHelper } from './helpers';
import { AppointmentWithUser } from './types';
import { AppointmentGraphResult } from './interfaces';
import { HandleErrorsService } from 'src/common/services';
import { AppConfigService } from 'src/config';

@Injectable()
export class AppointmentService {
    private readonly logger = new Logger(AppointmentService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: AppConfigService,
        private readonly appointmentHelper: AppointmentHelper,
        private readonly handleErrorsService: HandleErrorsService
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
                data: { patientId, doctorId, date },
                select: appointmentSelect
            });

            const {
                patient: { fullName: patientName },
                doctor: { fullName: doctorName },
            } = appointment;

            this.logger.log(`📢 Sending notification to admin about new appointment with traceId: ${traceId}`);

            this.appointmentHelper.sendNotificationWithFallback(
                this.config.admin.id,
                `${patientName}'s appointment with ${doctorName} is booked for ${date}.`,
                traceId,
                { appointmentId: appointment.id },
                'Failed to send notification about new appointment',
            );

            return {
                appointment: new AppointmentResponseDto(appointment as AppointmentWithUser),
                message: 'Appointment created successfully',
            };
        }

        catch (error) {
            this.handleErrorsService.handleUniqueConstraintError(error)
        }
    }

    /** ----------------------
    * GET ALL
    * ---------------------- */
    async getAllAppointments(query: GetAppointmentsDto, user: UserDto) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const { query: where, orderBy } = this.appointmentHelper.buildAppointmentQuery(query, user);

        const [appointments, totalAppointments] = await Promise.all([
            this.prisma.appointment.findMany({
                where,
                orderBy,
                select: appointmentSelect,
                take: limit,
                skip
            }),
            this.prisma.appointment.count({ where }),
        ]);

        return {
            appointments: appointments.map(appointment => new AppointmentResponseDto(appointment as AppointmentWithUser)),
            pagination: new PaginationResponseDto(totalAppointments, page, limit)
        };
    }

    /** ----------------------
    * GET COUNTS
    * ---------------------- */
    async getAllAppointmentCount(user: UserDto) {
        const query = this.appointmentHelper.applyRoleBasedScope(user, {});

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
            this.prisma.appointment.findMany({ where: query, distinct: 'patientId', select: { patientId: true } }),
            this.prisma.appointment.findMany({ where: query, distinct: 'doctorId', select: { doctorId: true } }),
            this.prisma.appointment.count({ where: { ...query, status: Status.PENDING } }),
            this.prisma.appointment.count({ where: { ...query, status: Status.CONFIRMED } }),
            this.prisma.appointment.count({ where: { ...query, status: Status.RUNNING } }),
            this.prisma.appointment.count({ where: { ...query, status: Status.COMPLETED } }),
            this.prisma.appointment.count({ where: { ...query, status: Status.CANCELLED } }),
            this.prisma.appointment.count({ where: { ...query, isPaid: true } }),
            this.prisma.appointment.count({ where: { ...query, isPaid: false } }),
            this.prisma.appointment.count({ where: { ...query, paymentMethod: Method.CASH } }),
            this.prisma.appointment.count({ where: { ...query, paymentMethod: Method.ONLINE } }),
        ]);

        const countResponse = new AppointmentCountResponseDto({
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
        })
        
        return {
            count: countResponse,
            message: 'Appointments count fetched successfully'
        };
    }

    /** ----------------------
    * GET GRAPH
    * ---------------------- */
    async getTotalAppointmentsGraph(user: UserDto) {

        const { doctorId, patientId } = this.appointmentHelper.applyRoleBasedScope(user, {});

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
        ]

        let whereClause = '';
        const values: string[] = [];

        if (doctorId && typeof doctorId === 'string') {
            whereClause = `WHERE "doctorId" = $1`;
            values.push(doctorId);
        }

        else if (patientId && typeof patientId === 'string') {
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

        const rawResult = values.length > 0
            ? await this.prisma.$queryRawUnsafe<AppointmentGraphResult[]>(query, ...values)
            : await this.prisma.$queryRawUnsafe<AppointmentGraphResult[]>(query);

        const result = rawResult.map(item => ({
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
        appointment: AppointmentWithUser,
        userRole: string
    ) {
        const body = await this.appointmentHelper.prepareAppointmentUpdate(dto, appointment, traceId, userRole);

        await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: body
        });

        return {
            message: 'Appointment updated successfully'
        };
    }
}

