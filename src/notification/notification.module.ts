import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommonModule } from 'src/common/common.module';
import { NotificationController } from './notifications.controller';
import { ConfigModule } from '@nestjs/config';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
    PrismaModule,
    CommonModule,
    ConfigModule
  ],
  providers: [NotificationProcessor, NotificationService, NotificationGateway],
  exports: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
