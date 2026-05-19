import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Role } from '@dab/shared';
import { Session } from './session.entity';
import { Doctor } from './doctor.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { Payment } from './payment.entity';
import { Review } from './review.entity';

@Entity('User')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', name: 'fullName' })
	fullName: string;

	@Column({ type: 'varchar', name: 'role', default: Role.PATIENT })
	role: string;

	@Column({ type: 'varchar', name: 'phone', nullable: true })
	phone: string | null;

	@Column({ type: 'varchar', name: 'gender', nullable: true })
	gender: string | null;

	@Column({ type: 'timestamp', name: 'birthDate', nullable: true })
	birthDate: Date | null;

	@Column({ type: 'varchar', name: 'address', nullable: true })
	address: string | null;

	@Column({ type: 'varchar', name: 'avatarImage', default: '' })
	avatarImage: string;

	@Column({ type: 'boolean', name: 'isOnline', default: false })
	isOnline: boolean;

	@Column({ type: 'timestamp', name: 'lastActiveAt', nullable: true })
	lastActiveAt: Date | null;

	@CreateDateColumn({ name: 'createdAt' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updatedAt' })
	updatedAt: Date;

	@OneToOne(() => Doctor, (doctor: Doctor) => doctor.user)
	doctor: Relation<Doctor>;

	@OneToMany(() => Session, (session: Session) => session.user)
	sessions: Relation<Session[]>;

	@OneToMany(() => Message, (msg: Message) => msg.sender)
	sentMessages: Relation<Message[]>;

	@OneToMany(() => Message, (msg: Message) => msg.receiver)
	receivedMessages: Relation<Message[]>;

	@OneToMany(() => Review, (r: Review) => r.patient)
	patientReviews: Relation<Review[]>;

	@OneToMany(() => Review, (r: Review) => r.doctor)
	doctorReviews: Relation<Review[]>;

	@OneToMany(() => Notification, (n: Notification) => n.user)
	notifications: Relation<Notification[]>;

	@OneToMany(() => Payment, (p: Payment) => p.user)
	onlinePayments: Relation<Payment[]>;
}
