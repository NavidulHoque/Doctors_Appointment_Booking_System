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
import { AppointmentProducerService } from './appointment.producer.service';
import { AppointmentConsumer } from './appointment.consumer';
import { SocketModule } from 'src/socket/socket.module';
import { KafkaModule } from 'src/kafka/kafka.module';

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
    EmailModule,
    SocketModule,
    KafkaModule
  ],
  controllers: [AppointmentController, AppointmentConsumer],
  providers: [AppointmentService, AppointmentProcessor, DLQProcessor, AppointmentProducerService]
})
export class AppointmentModule { }
