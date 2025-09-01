import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationController } from './notifications.controller';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
    PrismaModule,
    ConfigModule,
    SocketModule
  ],
  providers: [NotificationProcessor, NotificationService],
  exports: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
