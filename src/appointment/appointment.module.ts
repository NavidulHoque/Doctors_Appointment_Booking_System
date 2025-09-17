import { Global, Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentProcessor } from './processors';
import { BullModule } from '@nestjs/bull';
import { DLQProcessor } from './processors/dlq.processor';
import { AppointmentProducerService } from './appointment.producer.service';
import { AppointmentConsumer } from './appointment.consumer';

@Global()
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
  providers: [AppointmentService, AppointmentProcessor, DLQProcessor, AppointmentProducerService],
  exports: [AppointmentService],
})
export class AppointmentModule { }
