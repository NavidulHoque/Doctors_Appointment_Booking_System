import { Processor, Process, OnQueueFailed, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { NotificationService } from './notification.service';
import { Logger } from '@nestjs/common';

@Processor('notification-queue')
export class NotificationProcessor {
    private readonly logger = new Logger(NotificationProcessor.name);

    constructor(
        private readonly notificationService: NotificationService,
        @InjectQueue('failed-notifications') 
    private readonly failedQueue: Queue, // inject DLQ
    ) { }

    @Process('send-notification')
    async handleNotification(job: Job) {
        const { userId, content } = job.data;
        await this.notificationService.createNotification(userId, content);
    }

    @OnQueueFailed()
    async handleFailed(job: Job, error: any) {
        this.logger.error(
            `❌ Job ${job.id} failed after ${job.attemptsMade} attempts. Moving to DLQ...`,
        );

        await this.failedQueue.add('failed-notification', {
            ...job.data,
            failedReason: error.message,
            failedAt: new Date(),
        });
    }
}
