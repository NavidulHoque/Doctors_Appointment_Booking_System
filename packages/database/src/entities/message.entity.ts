import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { BaseGeneratedUUIDEntity } from './base-uuid.entity';

@Entity('Message')
export class Message extends BaseGeneratedUUIDEntity {
	@Column({ type: 'varchar', name: 'content' })
	content: string;

	@Index('idx_message__senderId')
	@Column({ type: 'uuid', name: 'senderId' })
	senderId: string;

	@Index('idx_message__receiverId')
	@Column({ type: 'uuid', name: 'receiverId' })
	receiverId: string;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'senderId', foreignKeyConstraintName: 'FK_message__senderId' })
	sender: User;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'receiverId', foreignKeyConstraintName: 'FK_message__receiverId' })
	receiver: User;
}
