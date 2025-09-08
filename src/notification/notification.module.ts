import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { NotificationController } from './notifications.controller';
import { DLQProcessor } from './dlq.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
    BullModule.registerQueue({
      name: 'failed-notification', // DLQ
    })
  ],
  providers: [NotificationProcessor, NotificationService, DLQProcessor],
  exports: [NotificationService],
  controllers: [NotificationController]
})
export class NotificationModule {}
