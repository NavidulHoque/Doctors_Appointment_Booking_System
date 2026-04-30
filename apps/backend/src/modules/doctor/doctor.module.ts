import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Doctor, Review, Appointment } from '@dab/database';
import { RealtimeModule } from '@dab/backend/modules/realtime/realtime.module';
import { DoctorService } from '@dab/backend/modules/doctor/doctor.service';
import { DoctorController } from '@dab/backend/modules/doctor/doctor.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Doctor, Review, Appointment]),
		RealtimeModule,
	],
	providers: [DoctorService],
	controllers: [DoctorController],
	exports: [DoctorService],
})
export class DoctorModule {}
