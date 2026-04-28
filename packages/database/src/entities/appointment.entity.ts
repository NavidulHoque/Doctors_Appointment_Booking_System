import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
	Unique,
	UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { AppointmentStatus } from '@dab/shared';
import { User } from './user.entity';
import { Payment } from './payment.entity';

@Entity('Appointment')
@Unique('UQ_appointment__patientId_date', ['patientId', 'date'])
@Unique('UQ_appointment__doctorId_date', ['doctorId', 'date'])
export class Appointment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index('idx_appointment__patientId')
	@Column({ type: 'uuid', name: 'patientId' })
	patientId: string;

	@Index('idx_appointment__doctorId')
	@Column({ type: 'uuid', name: 'doctorId' })
	doctorId: string;

	@Column({ type: 'timestamp', name: 'date' })
	date: Date;

	@Column({ type: 'varchar', name: 'status', default: AppointmentStatus.PENDING })
	status: string;

	@Column({ type: 'varchar', name: 'cancellationReason', default: '' })
	cancellationReason: string;

	@Column({ type: 'boolean', name: 'isPaid', default: false })
	isPaid: boolean;

	@Column({ type: 'varchar', name: 'paymentMethod', nullable: true })
	paymentMethod: string | null;

	@CreateDateColumn({ name: 'createdAt' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updatedAt' })
	updatedAt: Date;

	@ManyToOne(() => User, (user: User) => user.patientAppointments)
	@JoinColumn({ name: 'patientId', foreignKeyConstraintName: 'FK_appointment__patientId' })
	patient: Relation<User>;

	@ManyToOne(() => User, (user: User) => user.doctorAppointments)
	@JoinColumn({ name: 'doctorId', foreignKeyConstraintName: 'FK_appointment__doctorId' })
	doctor: Relation<User>;

	@OneToOne(() => Payment, (payment: Payment) => payment.appointment)
	onlinePayment: Relation<Payment>;
}
