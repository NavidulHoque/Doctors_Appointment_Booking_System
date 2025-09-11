import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { DoctorConsumer } from './doctor.consumer';
import { DoctorProducerService } from './doctor.producer.service';

@Module({
  controllers: [DoctorController, DoctorConsumer],
  providers: [DoctorService, DoctorProducerService],
})
export class DoctorModule { }
