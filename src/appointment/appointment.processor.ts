import { Processor, Process, OnQueueFailed, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { AppointmentService } from './appointment.service';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';

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
        const { status, id, traceId } = job.data;
        const dto = { status }
        await this.appointmentService.updateAppointment(dto, id, traceId);
    }

    @OnQueueFailed()
    async handleFailedNotification(job: Job, error: any) {
        this.logger.error(
            `❌ Job ${job.id} failed after ${job.attemptsMade} attempts with traceId=${job.data.traceId}. Moving to DLQ...`,
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
                    attempts: 5,           
                    removeOnComplete: true, 
                    removeOnFail: false,    
                }
            );
        }

        catch (error) {
            this.logger.error(
                `❌ Job ${job.id} failed to move to DLQ. Reason: ${error.message} with traceId=${job.data.traceId}`
            );

            this.email.alertAdmin(
                'CRITICAL: DLQ Insertion Failure',
                `DLQ insertion failed for jobId=${job.id}, userId=${job.data.userId}, traceId=${job.data.traceId}. Reason: ${error.message}`
            )
                .catch((error) => this.logger.error(
                    `❌ Failed to alert admin. Reason: ${error.message} with traceId=${job.data.traceId}`
                ));
        }
    }
}
