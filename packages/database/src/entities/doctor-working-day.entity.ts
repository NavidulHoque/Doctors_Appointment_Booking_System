import { Column, Entity, JoinColumn, ManyToOne, Unique, OneToOne } from "typeorm";
import { WeekDays } from '@dab/shared';
import type { WeekDaysType } from '@dab/shared';
import { Doctor } from "./doctor.entity";
import { BaseGeneratedUUIDEntity } from "./base-uuid.entity";
import { DoctorBreakTime } from "./doctor-break-time.entity";

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

	@Column({ type: 'boolean', name: 'isActive', default: false })
	isActive: boolean;

	@ManyToOne(() => Doctor, (doctor) => doctor.workingDays, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'doctorId', foreignKeyConstraintName: 'FK_doctor_working_day_doctorId' })
	doctor: Doctor;

	@OneToOne(() => DoctorBreakTime, (bt) => bt.workingDay, {
		cascade: ['insert', 'update'],
	})
	breakTime: DoctorBreakTime | null;
}