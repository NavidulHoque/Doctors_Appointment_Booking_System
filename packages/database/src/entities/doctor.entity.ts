import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	OneToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity';

@Entity('Doctor')
export class Doctor {
	@PrimaryColumn({ type: 'uuid', name: 'userId' })
	userId: string;

	@Index('idx_doctor__specialization')
	@Column({ type: 'varchar', name: 'specialization' })
	specialization: string;

	@Column({ type: 'varchar', name: 'education' })
	education: string;

	@Column({ type: 'int', name: 'experience' })
	experience: number;

	@Column({ type: 'varchar', name: 'aboutMe' })
	aboutMe: string;

	@Column({ type: 'int', name: 'fees' })
	fees: number;

	@Column({ type: 'int', name: 'revenue', default: 0 })
	revenue: number;

	@Column({ type: 'text', name: 'availableTimes', array: true })
	availableTimes: string[];

	@Column({ type: 'boolean', name: 'isActive', default: false })
	isActive: boolean;

	@Column({ type: 'varchar', name: 'stripeAccountId', nullable: true, unique: true })
	stripeAccountId: string | null;

	@Column({ type: 'boolean', name: 'isStripeAccountActive', default: false })
	isStripeAccountActive: boolean;

	@CreateDateColumn({ name: 'createdAt' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updatedAt' })
	updatedAt: Date;

	@OneToOne(() => User, (user: User) => user.doctor)
	@JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_doctor__userId' })
	user: Relation<User>;
}
