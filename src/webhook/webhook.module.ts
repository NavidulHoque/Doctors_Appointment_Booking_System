// src/webhook/webhook.module.ts
import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller'; 
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [WebhookController],
  providers: [PrismaService],
})
export class WebhookModule {}
