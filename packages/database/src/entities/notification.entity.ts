import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity';

@Entity('Notification')
export class Notification {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'varchar', name: 'content' })
	content: string;

	@Index('idx_notification__userId')
	@Column({ type: 'uuid', name: 'userId' })
	userId: string;

	@CreateDateColumn({ name: 'createdAt' })
	createdAt: Date;

	@ManyToOne(() => User, (user: User) => user.notifications)
	@JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_notification__userId' })
	user: Relation<User>;
}
