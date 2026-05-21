import {
	Column,
	Entity,
	OneToMany,
	OneToOne,
} from 'typeorm';
import { Role } from '@dab/shared';
import { Doctor } from './doctor.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { Review } from './review.entity';
import { BaseUUIDEntity } from './base-uuid.entity';

@Entity('User')
export class User extends BaseUUIDEntity {
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

	@OneToOne(() => Doctor, {
		cascade: ['insert', 'update'],
	})
	doctor: Doctor;

	@OneToMany(() => Message, (msg: Message) => msg.sender)
	sentMessages: Message[];

	@OneToMany(() => Message, (msg: Message) => msg.receiver)
	receivedMessages: Message[];

	@OneToMany(() => Review, (r: Review) => r.patient)
	patientReviews: Review[];

	@OneToMany(() => Review, (r: Review) => r.doctor)
	doctorReviews: Review[];

	@OneToMany(() => Notification, (n: Notification) => n.user)
	notifications: Notification[];
}
