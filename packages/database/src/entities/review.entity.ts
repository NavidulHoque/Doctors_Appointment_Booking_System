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

@Entity('Review')
export class Review {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index('idx_review__patientId')
	@Column({ type: 'uuid', name: 'patientId' })
	patientId: string;

	@Index('idx_review__doctorId')
	@Column({ type: 'uuid', name: 'doctorId' })
	doctorId: string;

	@Column({ type: 'varchar', name: 'comment', nullable: true })
	comment: string | null;

	@Column({ type: 'int', name: 'rating' })
	rating: number;

	@CreateDateColumn({ name: 'createdAt' })
	createdAt: Date;

	@ManyToOne(() => User, (user: User) => user.patientReviews)
	@JoinColumn({ name: 'patientId', foreignKeyConstraintName: 'FK_review__patientId' })
	patient: Relation<User>;

	@ManyToOne(() => User, (user: User) => user.doctorReviews)
	@JoinColumn({ name: 'doctorId', foreignKeyConstraintName: 'FK_review__doctorId' })
	doctor: Relation<User>;
}
