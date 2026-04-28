import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Appointment } from '@dab/database';
import { AppointmentService } from '@backend/modules/appointment/appointment.service';
import { AppointmentController } from '@backend/modules/appointment/appointment.controller';
import { AppointmentHandler } from '@backend/modules/appointment/handlers/appointment.handler';
import { AppointmentHelper } from '@backend/modules/appointment/helpers/appointment.helper';
import { NotificationModule } from '@backend/modules/notification/notification.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Appointment]),
		NotificationModule,
	],
	providers: [AppointmentService, AppointmentHandler, AppointmentHelper],
	controllers: [AppointmentController],
})
export class AppointmentModule {}
