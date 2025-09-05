import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { ConfigModule } from '@nestjs/config';
import { DoctorModule } from 'src/doctor/doctor.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NotificationModule } from 'src/notification/notification.module';
import { AppointmentProcessor } from './appointment.processor';
import { BullModule } from '@nestjs/bull';
import { EmailModule } from 'src/email/email.module';
import { DLQProcessor } from './dlq.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'appointment-queue',
    }),
    BullModule.registerQueue({
      name: 'failed-appointment', // DLQ
    }),
    ConfigModule,
    DoctorModule,
    PrismaModule,
    NotificationModule,
    EmailModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentProcessor, DLQProcessor]
})
export class AppointmentModule { }
