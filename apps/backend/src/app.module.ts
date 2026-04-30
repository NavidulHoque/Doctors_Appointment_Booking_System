import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AppConfigModule } from '@dab/backend/modules/config/config.module';
import { DatabaseModule } from '@dab/backend/modules/database/database.module';
import { SupabaseModule } from '@dab/backend/modules/supabase/supabase.module';
import { RealtimeModule } from '@dab/backend/modules/realtime/realtime.module';
import { EmailModule } from '@dab/backend/modules/email/email.module';

import { AuthModule } from '@dab/backend/modules/auth/auth.module';
import { UserModule } from '@dab/backend/modules/user/user.module';
import { DoctorModule } from '@dab/backend/modules/doctor/doctor.module';
import { AppointmentModule } from '@dab/backend/modules/appointment/appointment.module';
import { PaymentModule } from '@dab/backend/modules/payment/payment.module';
import { WebhookModule } from '@dab/backend/modules/webhook/webhook.module';
import { ReviewModule } from '@dab/backend/modules/review/review.module';
import { MessageModule } from '@dab/backend/modules/message/message.module';
import { NotificationModule } from '@dab/backend/modules/notification/notification.module';
import { UploadsModule } from '@dab/backend/modules/uploads/uploads.module';
import { CronModule } from '@dab/backend/modules/cron/cron.module';

import { GlobalExceptionFilter } from '@dab/backend/common/filters/global-exception.filter';
import { AuthGuard } from '@dab/backend/common/guards/auth.guard';
import { RolesGuard } from '@dab/backend/common/guards/roles.guard';
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
