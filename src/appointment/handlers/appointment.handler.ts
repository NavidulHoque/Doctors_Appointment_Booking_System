import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Appointment as PrismaAppointment, Role, Status } from "@prisma/client";
import { AppointmentHelper } from "../helpers";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from 'bull';
import { UpdateAppointmentDto } from "../dtos";
import { AppointmentWithUser } from "../types";

@Injectable()
export class AppointmentHandler {

    constructor(
        @Inject(forwardRef(() => AppointmentHelper))
        private readonly appointmentHelper: AppointmentHelper,
        @InjectQueue('appointment-queue') private readonly appointmentQueue: Queue
    ) {}

    async handleConfirm(
        appointment: AppointmentWithUser,
        traceId: string,
        userRole: string
    ) {
        const { id: appointmentId, patient, doctor, date, status: currentStatus } = appointment;
        const { id: patientId, fullName: patientName } = patient;
        const { id: doctorId, fullName: doctorName } = doctor;
        const now = new Date();

        if (userRole !== Role.ADMIN) {
            throw new ForbiddenException("Only admin can confirm appointments");
        }

        else if (currentStatus !== 'PENDING') {
            throw new ForbiddenException("Appointment must be in pending status to confirm");
        }

        const oneHourBefore = new Date(date.getTime() - 60 * 60 * 1000);

        await Promise.all([
            this.appointmentHelper.sendNotificationWithFallback(
                patientId,
                `Your appointment with ${doctorName} is confirmed for ${date.toString()}.`,
                traceId,
                { appointmentId },
                'Failed to send appointment confirmation',
            ),
            this.appointmentHelper.sendNotificationWithFallback(
                doctorId,
                `Your appointment with ${patientName} is confirmed for ${date.toString()}.`,
                traceId,
                { appointmentId },
                'Failed to send appointment confirmation',
            ),
        ]);

        await Promise.all([
            this.appointmentHelper.sendNotificationWithFallback(
                patientId,
                `Your appointment with ${doctorName} starts in 1 hour.`,
                traceId,
                { appointmentId },
                'Failed to send appointment reminder',
                oneHourBefore.getTime() - now.getTime(),
            ),
            this.appointmentHelper.sendNotificationWithFallback(
                doctorId,
                `Your appointment with ${patientName} starts in 1 hour.`,
                traceId,
                { appointmentId },
                'Failed to send appointment reminder',
                oneHourBefore.getTime() - now.getTime(),
            ),
            this.appointmentQueue.add(
                'start-appointment',
                { status: Status.RUNNING, appointment, traceId, userRole },
                {
                    delay: date.getTime() - now.getTime(),
                    backoff: { type: 'exponential', delay: 5000 },
                    attempts: 5,
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            ),
        ]);

        return { status: Status.CONFIRMED };
    }

    handleCancel(
        dto: UpdateAppointmentDto,
        appointment: AppointmentWithUser,
        traceId: string,
    ) {
        const { id: appointmentId, doctor, date, status: currentStatus, patient } = appointment;
        const { fullName: doctorName } = doctor;
        const { id: patientId } = patient;
        const { cancellationReason } = dto;

        if (currentStatus === 'COMPLETED') {
            throw new ForbiddenException("Cannot cancel a completed appointment");
        }

        else if (!cancellationReason) {
            throw new BadRequestException("Cancellation reason is required to cancel an appointment");
        }

        this.appointmentHelper.sendNotificationWithFallback(
            patientId,
            `Your appointment with ${doctorName} was cancelled on ${date.toString()}. Reason: ${cancellationReason}`,
            traceId,
            { appointmentId },
            'Failed to send appointment cancellation'
        );

        return { status: Status.CANCELLED, cancellationReason };
    }

    handleComplete(
        appointment: AppointmentWithUser,
        userRole: string
    ) {
        const { status: currentStatus, isPaid, paymentMethod } = appointment;

        if (userRole !== Role.ADMIN) {
            throw new ForbiddenException("Only admin can complete appointments");
        }

        else if (currentStatus !== 'RUNNING') {
            throw new ForbiddenException("Appointment must be in running status to complete");
        }

        const body: Partial<PrismaAppointment> = { status: Status.COMPLETED };

        if (!isPaid && !paymentMethod) {
            body.isPaid = true;
            body.paymentMethod = 'CASH';
        }

        return body;
    }

    handleRunning(
        appointment: AppointmentWithUser,
        userRole: string
    ) {
        const { status: currentStatus } = appointment;
        if (userRole !== Role.ADMIN) {
            throw new ForbiddenException("Only admin can mark appointments as running");
        }

        else if (currentStatus !== 'CONFIRMED') {
            throw new ForbiddenException("Appointment must be in confirmed status to mark as running");
        }

        return { status: Status.RUNNING };
    }
} 