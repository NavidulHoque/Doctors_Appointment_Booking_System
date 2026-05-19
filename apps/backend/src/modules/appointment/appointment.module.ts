import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Appointment } from '@dab/database';
import { AppointmentService } from '@dab/backend/modules/appointment/appointment.service';
import { AppointmentController } from '@dab/backend/modules/appointment/appointment.controller';
import { AppointmentHandler } from '@dab/backend/modules/appointment/handlers/appointment.handler';
import { NotificationModule } from '@dab/backend/modules/notification/notification.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Appointment]),
		NotificationModule,
	],
	providers: [AppointmentService, AppointmentHandler],
	controllers: [AppointmentController],
})
export class AppointmentModule {}
