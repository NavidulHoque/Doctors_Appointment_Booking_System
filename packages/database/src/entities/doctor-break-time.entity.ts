import { Entity, JoinColumn, OneToOne, PrimaryColumn, Column } from "typeorm";
import { DoctorWorkingDay } from "./doctor-working-day.entity";
import { BaseTimestampEntity } from "./base-timestamp.entity";

@Entity('DoctorBreakTime')
export class DoctorBreakTime extends BaseTimestampEntity {
	@PrimaryColumn({ type: 'uuid', name: 'workingDayId' })
	workingDayId: string;

    @Column({ type: 'varchar', name: 'startTime' })
	startTime: string;

	@Column({ type: 'varchar', name: 'endTime' })
	endTime: string;

	@OneToOne(() => DoctorWorkingDay, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'workingDayId', foreignKeyConstraintName: 'FK_doctor_break_time_working_dayId' })
	workingDay: DoctorWorkingDay;
}