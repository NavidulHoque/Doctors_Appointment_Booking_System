import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToOne,
} from 'typeorm';
import { PaymentStatus } from '@dab/shared';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { BaseGeneratedUUIDEntity } from './base-uuid.entity';

@Entity('Payment')
export class Payment extends BaseGeneratedUUIDEntity {
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

	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_payment__userId' })
	user: User;

	@OneToOne(() => Appointment)
	@JoinColumn({ name: 'appointmentId', foreignKeyConstraintName: 'FK_payment__appointmentId' })
	appointment: Appointment;
}
