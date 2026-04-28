import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { PaymentStatus } from '@dab/shared';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';

@Entity('Payment')
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index('idx_payment__userId')
	@Column({ type: 'uuid', name: 'userId' })
	userId: string;

	@Column({ type: 'uuid', name: 'appointmentId', unique: true })
	appointmentId: string;

	@Column({ type: 'float', name: 'amount' })
	amount: number;

	@Column({ type: 'varchar', name: 'transactionId', unique: true })
	transactionId: string;

	@Column({ type: 'varchar', name: 'status', default: PaymentStatus.PENDING })
	status: string;

	@CreateDateColumn({ name: 'createdAt' })
	createdAt: Date;

	@ManyToOne(() => User, (user: User) => user.onlinePayments)
	@JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_payment__userId' })
	user: Relation<User>;

	@OneToOne(() => Appointment, (appt: Appointment) => appt.onlinePayment)
	@JoinColumn({ name: 'appointmentId', foreignKeyConstraintName: 'FK_payment__appointmentId' })
	appointment: Relation<Appointment>;
}
