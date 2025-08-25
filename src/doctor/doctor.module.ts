import { Module, forwardRef } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { ConfigModule } from '@nestjs/config';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { CommonModule } from 'src/common/common.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, forwardRef(() => AppointmentModule), CommonModule, PrismaModule],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule { }
