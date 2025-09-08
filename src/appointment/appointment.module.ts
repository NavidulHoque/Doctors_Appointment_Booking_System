import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentProcessor } from './appointment.processor';
import { BullModule } from '@nestjs/bull';
import { DLQProcessor } from './dlq.processor';
import { AppointmentProducerService } from './appointment.producer.service';
import { AppointmentConsumer } from './appointment.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'appointment-queue',
    }),
    BullModule.registerQueue({
      name: 'failed-appointment', // DLQ
    }),
  ],
  controllers: [AppointmentController, AppointmentConsumer],
  providers: [AppointmentService, AppointmentProcessor, DLQProcessor, AppointmentProducerService]
})
export class AppointmentModule { }
