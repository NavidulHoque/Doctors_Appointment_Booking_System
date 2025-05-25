import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
  ],
  providers: [NotificationProcessor, NotificationService],
})
export class NotificationModule {}
