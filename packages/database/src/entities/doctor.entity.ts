import {
	Column,
	Entity,
	Index,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryColumn
} from 'typeorm';
import { User } from './user.entity';
import { DoctorWorkingDay } from './doctor-working-day.entity';
import { BaseTimestampEntity } from './base-timestamp.entity';
import { StripeAccountStatus } from '@dab/shared/src/enums';

@Entity('Doctor')
export class Doctor extends BaseTimestampEntity {
	@PrimaryColumn({ type: 'uuid', name: 'userId' })
	userId: string;

	@Index('idx_doctor__specialization')
	@Column({ type: 'varchar', name: 'specialization' })
	specialization: string;

	@Column({ type: 'varchar', name: 'education' })
	education: string;

	@Index('idx_doctor_experience')
	@Column({ type: 'int', name: 'experience' })
	experience: number;

	@Column({ type: 'varchar', name: 'aboutMe' })
	aboutMe: string;

	@Index('idx_doctor_fees')
	@Column({ type: 'int', name: 'fees' })
	fees: number;

	@Column({ type: 'int', name: 'revenue', default: 0 })
	revenue: number;

	@Column({ type: 'varchar', name: 'stripeAccountId', nullable: true, unique: true })
	stripeAccountId: string | null;

	@Column({ type: 'enum', enum: StripeAccountStatus, default: StripeAccountStatus.NOT_CREATED })
	stripeAccountStatus: StripeAccountStatus;

	@OneToOne(() => User, (user: User) => user.doctor, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_doctor__userId' })
	user: User;

	@OneToMany(() => DoctorWorkingDay, (wd) => wd.doctor, {
		cascade: ['insert', 'update']
	})
	workingDays: DoctorWorkingDay[];
}
