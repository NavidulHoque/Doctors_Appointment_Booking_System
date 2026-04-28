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

@Entity('Session')
export class Session {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index('idx_session__userId')
	@Column({ type: 'uuid', name: 'userId' })
	userId: string;

	@Column({ type: 'varchar', name: 'deviceName', nullable: true })
	deviceName: string | null;

	@Column({ type: 'varchar', name: 'refreshToken' })
	refreshToken: string;

	@Column({ type: 'timestamp', name: 'expiresAt' })
	expiresAt: Date;

	@CreateDateColumn({ name: 'createdAt' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updatedAt' })
	updatedAt: Date;

	@ManyToOne(() => User, (user: User) => user.sessions, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FK_session__userId' })
	user: Relation<User>;
}
