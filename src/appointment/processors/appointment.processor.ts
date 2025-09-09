import { Processor, Process, OnQueueFailed, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { AppointmentService } from '../appointment.service';

@Processor('appointment-queue')
export class AppointmentProcessor {
    private readonly logger = new Logger(AppointmentProcessor.name)

    constructor(
        private readonly appointmentService: AppointmentService,
        private readonly email: EmailService,
        @InjectQueue('failed-appointment') private readonly failedQueue: Queue, // inject DLQ
    ) { }

    @Process('start-appointment')
    async handleStartAppointment(job: Job) {
        const { status, appointment, traceId } = job.data;
        await this.appointmentService.updateAppointment({ status, appointment }, traceId);
    }

    @OnQueueFailed()
    async handleFailedAppointment(job: Job, error: any) {
        const { status, appointmentId, traceId } = job.data;

        this.logger.error(
            `❌ Job ${job.id} failed after ${job.attemptsMade} attempts with traceId=${traceId}. Moving to DLQ...`,
        );

        try {
            await this.failedQueue.add(
                'failed-appointment',
                {
                    ...job.data,
                    failedReason: error.message,
                    failedAt: new Date(),
                },
                {
                    backoff: { type: 'exponential', delay: 5000 },
                    attempts: 3,           
                    removeOnComplete: true, 
                    removeOnFail: false   
                }
            );
        }

        catch (error) {
            this.logger.error(
                `❌ Job ${job.id} failed to move to DLQ. Reason: ${error.message} with traceId=${traceId}`
            );

            this.email.alertAdmin(
                'Appointment Status Update Failure',
                `Failed to update appointment status,<br>
                 AppointmentId=${appointmentId},<br>
                 Status=${status},<br>
                 TraceId=${traceId},<br>
                 Reason: ${error.message}`
            )
                .catch((error) => this.logger.error(
                    `❌ Failed to alert admin. Reason: ${error.message} with traceId=${traceId}`
                ));
        }
    }
}
