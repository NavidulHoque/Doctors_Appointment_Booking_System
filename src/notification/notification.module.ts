import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationController } from './notifications.controller';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from 'src/socket/socket.module';
import { EmailModule } from 'src/email/email.module';
import { DLQProcessor } from './dlq.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
    BullModule.registerQueue({
      name: 'failed-notification', // DLQ
    }),
    PrismaModule,
    ConfigModule,
    SocketModule,
    EmailModule
  ],
  providers: [NotificationProcessor, NotificationService, DLQProcessor],
  exports: [NotificationService],
  controllers: [NotificationController]
})
export class NotificationModule {}
