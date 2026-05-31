import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	Unique
} from 'typeorm';
import { User } from './user.entity';
import { BaseGeneratedUUIDEntity } from './base-uuid.entity';

@Entity('Review')
@Unique("UQ_review__patientId__doctorId", ['patientId', 'doctorId'])
export class Review extends BaseGeneratedUUIDEntity {
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

	@ManyToOne(() => User, (user: User) => user.patientReviews)
	@JoinColumn({ name: 'patientId', foreignKeyConstraintName: 'FK_review__patientId' })
	patient: User;

	@ManyToOne(() => User, (user: User) => user.doctorReviews)
	@JoinColumn({ name: 'doctorId', foreignKeyConstraintName: 'FK_review__doctorId' })
	doctor: User;
}
