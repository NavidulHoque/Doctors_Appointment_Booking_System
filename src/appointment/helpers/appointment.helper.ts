import { BadRequestException, forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { GetAppointmentsDto, UpdateAppointmentDto } from "../dto";
import { EmailService } from "src/email/email.service";
import { NotificationService } from "src/notification/notification.service";
import { UserDto } from "src/user/dto";
import { DateTime } from 'luxon';
import { Prisma, Role } from "@prisma/client";
import { AppointmentHandler } from "../handlers";
import { AppointmentWithUser } from "../types";
import { NotificationMeta } from "src/notification/interfaces";

@Injectable()
export class AppointmentHelper {
    private readonly logger = new Logger(AppointmentHelper.name);

    constructor(
        private readonly notificationService: NotificationService,
        private readonly email: EmailService,
        @Inject(forwardRef(() => AppointmentHandler))
        private readonly appointmentHandler: AppointmentHandler,
    ) { }

    async prepareAppointmentUpdate(
        dto: UpdateAppointmentDto,
        appointment: AppointmentWithUser,
        traceId: string,
        userRole: string
    ) {
        const { status } = dto;

        switch (status) {
            case 'CONFIRMED':
                return await this.appointmentHandler.handleConfirm(appointment, traceId, userRole);

            case 'CANCELLED':
                return this.appointmentHandler.handleCancel(dto, appointment, traceId);

            case 'COMPLETED':
                return this.appointmentHandler.handleComplete(appointment, userRole);

            case 'RUNNING':
                return this.appointmentHandler.handleRunning(appointment, userRole);

            default:
                return {};
        }
    }

    buildAppointmentQuery(dto: GetAppointmentsDto, user: UserDto) {
        const {
            search, status, isPaid,
            paymentMethod, isToday, isPast, isFuture,
        } = dto;

        const query = this.applyRoleBasedScope(user, {});

        if ([isToday, isPast, isFuture].filter(Boolean).length > 1) {
            throw new BadRequestException('Only one of isToday, isPast, or isFuture can be passed');
        }

        let orderBy: Prisma.AppointmentOrderByWithRelationInput = { date: 'desc' };
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

    applyRoleBasedScope(user: UserDto, query: Prisma.AppointmentWhereInput) {
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

    async sendNotificationWithFallback(
        userId: string,
        message: string,
        traceId: string,
        meta: NotificationMeta,
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