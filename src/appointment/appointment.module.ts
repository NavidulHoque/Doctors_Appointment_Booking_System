import { Global, Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentProcessor } from './processors';
import { BullModule } from '@nestjs/bull';
import { DLQProcessor } from './processors';
import { AppointmentHelper } from './helpers';
import { AppointmentHandler } from './handlers';

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
  providers: [
    AppointmentService,
    AppointmentProcessor, 
    DLQProcessor,
    AppointmentHelper,
    AppointmentHandler
  ],
  exports: [AppointmentService, AppointmentHelper, AppointmentHandler],
})
export class AppointmentModule { }
