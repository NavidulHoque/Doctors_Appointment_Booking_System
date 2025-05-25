import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
    PrismaModule
  ],
  providers: [NotificationProcessor, NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
