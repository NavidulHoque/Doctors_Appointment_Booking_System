import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity';

@Entity('Message')
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', name: 'content' })
	content: string;

	@Index('idx_message__senderId')
	@Column({ type: 'uuid', name: 'senderId' })
	senderId: string;

	@Index('idx_message__receiverId')
	@Column({ type: 'uuid', name: 'receiverId' })
	receiverId: string;

	@CreateDateColumn({ name: 'createdAt' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updatedAt' })
	updatedAt: Date;

	@ManyToOne(() => User, (user: User) => user.sentMessages)
	@JoinColumn({ name: 'senderId', foreignKeyConstraintName: 'FK_message__senderId' })
	sender: Relation<User>;

	@ManyToOne(() => User, (user: User) => user.receivedMessages)
	@JoinColumn({ name: 'receiverId', foreignKeyConstraintName: 'FK_message__receiverId' })
	receiver: Relation<User>;
}
