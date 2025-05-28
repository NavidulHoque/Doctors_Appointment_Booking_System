// src/webhook/webhook.module.ts
import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller'; 
import { ConfigModule } from '@nestjs/config';
import { WebhookService } from './webhook.service';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, CommonModule, NotificationModule, PrismaModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
