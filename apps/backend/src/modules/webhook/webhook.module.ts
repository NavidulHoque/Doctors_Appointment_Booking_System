import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment, Appointment } from '@dab/database';
import { NotificationModule } from '@backend/modules/notification/notification.module';
import { WebhookService } from '@backend/modules/webhook/webhook.service';
import { WebhookController } from '@backend/modules/webhook/webhook.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Payment, Appointment]), NotificationModule],
	providers: [WebhookService],
	controllers: [WebhookController],
})
export class WebhookModule {}
