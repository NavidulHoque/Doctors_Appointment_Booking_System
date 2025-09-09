import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notifications.controller';
import { DLQProcessor } from './processors/dlq.processor';
import { NotificationProcessor } from './processors';

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
