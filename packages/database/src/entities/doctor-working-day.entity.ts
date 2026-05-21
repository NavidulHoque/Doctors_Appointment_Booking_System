import { Column, Entity, JoinColumn, ManyToOne, Unique, OneToOne } from "typeorm";
import { WeekDays } from '@dab/shared';
import type { WeekDaysType } from '@dab/shared';
import { Doctor } from "./doctor.entity";
import { BaseGeneratedUUIDEntity } from "./base-uuid.entity";

@Entity('DoctorWorkingDay')
@Unique("UQ_doctor_working_day_doctorId_day", ['doctorId', 'day'])
export class DoctorWorkingDay extends BaseGeneratedUUIDEntity {
	@Column({ type: 'uuid', name: 'doctorId' })
	doctorId: string;

	@Column({ type: 'enum', enum: WeekDays, name: 'day' })
	day: WeekDaysType;

	@Column({ type: 'varchar', name: 'startTime' })
	startTime: string;

	@Column({ type: 'varchar', name: 'endTime' })
	endTime: string;

	@ManyToOne(() => Doctor, (doctor) => doctor.workingDays, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'doctorId', foreignKeyConstraintName: 'FK_doctor_working_day_doctorId' })
	doctor: Doctor;
}