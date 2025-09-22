import { Global, Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentProcessor } from './processors';
import { BullModule } from '@nestjs/bull';
import { DLQProcessor } from './processors/dlq.processor';

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
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentProcessor, DLQProcessor],
  exports: [AppointmentService],
})
export class AppointmentModule { }
