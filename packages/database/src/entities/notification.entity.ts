import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { BaseGeneratedUUIDEntity } from './base-uuid.entity';

@Entity('Notification')
export class Notification extends BaseGeneratedUUIDEntity {
	@Column({ type: 'varchar', name: 'content' })
	content: string;

	@Index('idx_notification__userId')
	@Column({ type: 'uuid', name: 'userId' })
	userId: string;

	@ManyToOne(() => User, (user: User) => user.notifications)
	@JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_notification__userId' })
	user: User;
}
