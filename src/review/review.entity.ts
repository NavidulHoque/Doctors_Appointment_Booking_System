import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, u => u.patientReviews)
  patient: User;

  @Column()
  patientId: string;

  @ManyToOne(() => User, u => u.doctorReviews)
  doctor: User;

  @Column()
  doctorId: string;

  @Column({ nullable: true })
  comment: string;

  @Column()
  rating: number;

  @CreateDateColumn()
  createdAt: Date;
}
