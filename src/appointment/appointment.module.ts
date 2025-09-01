import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { ConfigModule } from '@nestjs/config';
import { DoctorModule } from 'src/doctor/doctor.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/notification/notification.module';
import { AppointmentProcessor } from './appointment.processor';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'appointment-queue',
    }),
    ConfigModule,
    DoctorModule,
    PrismaModule,
    NotificationModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentProcessor]
})
export class AppointmentModule { }
