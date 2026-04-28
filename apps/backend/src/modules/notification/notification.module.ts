import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '@dab/database';
import { RealtimeModule } from '@backend/modules/realtime/realtime.module';
import { EmailModule } from '@backend/modules/email/email.module';
import { NotificationService } from '@backend/modules/notification/notification.service';
import { NotificationController } from '@backend/modules/notification/notification.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Notification]), RealtimeModule, EmailModule],
	providers: [NotificationService],
	controllers: [NotificationController],
	exports: [NotificationService],
})
export class NotificationModule {}
