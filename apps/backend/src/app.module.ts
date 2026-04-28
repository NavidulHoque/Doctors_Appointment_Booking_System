import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AppConfigModule } from '@backend/modules/config/config.module';
import { DatabaseModule } from '@backend/modules/database/database.module';
import { SupabaseModule } from '@backend/modules/supabase/supabase.module';
import { RealtimeModule } from '@backend/modules/realtime/realtime.module';
import { EmailModule } from '@backend/modules/email/email.module';

import { AuthModule } from '@backend/modules/auth/auth.module';
import { UserModule } from '@backend/modules/user/user.module';
import { DoctorModule } from '@backend/modules/doctor/doctor.module';
import { AppointmentModule } from '@backend/modules/appointment/appointment.module';
import { PaymentModule } from '@backend/modules/payment/payment.module';
import { WebhookModule } from '@backend/modules/webhook/webhook.module';
import { ReviewModule } from '@backend/modules/review/review.module';
import { MessageModule } from '@backend/modules/message/message.module';
import { NotificationModule } from '@backend/modules/notification/notification.module';
import { UploadsModule } from '@backend/modules/uploads/uploads.module';
import { CronModule } from '@backend/modules/cron/cron.module';

import { GlobalExceptionFilter } from '@backend/common/filters/global-exception.filter';
import { AuthGuard } from '@backend/common/guards/auth.guard';
import { RolesGuard } from '@backend/common/guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@dab/database';

@Module({
	imports: [
		AppConfigModule,
		DatabaseModule,
		SupabaseModule,
		RealtimeModule,
		EmailModule,
		ScheduleModule.forRoot(),
		ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

		// Feature modules
		AuthModule,
		UserModule,
		DoctorModule,
		AppointmentModule,
		PaymentModule,
		WebhookModule,
		ReviewModule,
		MessageModule,
		NotificationModule,
		UploadsModule,
		CronModule,

		// AuthGuard needs User repo — expose via root-level forFeature
		TypeOrmModule.forFeature([User]),
	],
	providers: [
		{ provide: APP_FILTER, useClass: GlobalExceptionFilter },
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		{ provide: APP_GUARD, useClass: AuthGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
})
export class AppModule {}
