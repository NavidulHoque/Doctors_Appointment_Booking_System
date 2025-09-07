import { Processor, Process, OnQueueFailed, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { NotificationService } from './notification.service';
import { Logger } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';

@Processor('notification-queue')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(
        private readonly notificationService: NotificationService,
        private readonly email: EmailService,
        @InjectQueue('failed-notification') private readonly failedQueue: Queue, // inject DLQ
    ) { }

    @Process('send-notification')
    async handleNotification(job: Job) {
        const { userId, content, traceId } = job.data;
        await this.notificationService.createNotification(userId, content, traceId);
    }

    @OnQueueFailed()
    async handleFailedNotification(job: Job, error: any) {
        const { userId, content, traceId, metadata } = job.data;

        this.logger.error(
            `❌ Job ${job.id} failed after ${job.attemptsMade} attempts with traceId=${traceId}. Moving to DLQ...`,
        );

        try {
            await this.failedQueue.add(
                'failed-notification',
                {
                    ...job.data,
                    failedReason: error.message,
                    failedAt: new Date(),
                },
                {
                    backoff: { type: 'exponential', delay: 5000 },
                    attempts: 3,           // retry up to 3 times if the job fails
                    removeOnComplete: true, // remove from queue after success
                    removeOnFail: false,    // keep in queue if failed
                }
            );
        }

        catch (error) {
            this.logger.error(
                `❌ Job ${job.id} failed to move to DLQ. Reason: ${error.message} with traceId=${traceId}`
            );

            this.email.alertAdmin(
                'Notification Delivery Failed',
                `Failed to send notification,<br>
                Content: ${content},<br>
                UserId: ${userId},<br>
                metadata: ${JSON.stringify(metadata)},<br> 
                Reason: ${error.message},<br>
                traceId=${traceId}`
            )
                .catch((error) => this.logger.error(
                    `❌ Failed to alert admin. Reason: ${error.message} with traceId=${traceId}`
                ));
        }
    }
}
