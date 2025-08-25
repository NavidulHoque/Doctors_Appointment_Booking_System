import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationService } from './notification.service';

@Processor('notification-queue')
export class NotificationProcessor {
    constructor(
        private readonly notificationService: NotificationService
    ) { }

    @Process('send-notification')
    async handleNotification(job: Job) {
        const { userId, content } = job.data;
        await this.notificationService.createNotification(userId, content);
    }
}
