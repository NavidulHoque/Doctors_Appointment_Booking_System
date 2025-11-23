import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user';

@Entity()
export class Doctor {
  @PrimaryColumn()
  userId: string;

  @OneToOne(() => User, user => user.doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  specialization: string;

  @Column()
  education: string;

  @Column()
  experience: number;

  @Column()
  aboutMe: string;

  @Column()
  fees: number;

  @Column({ default: 0 })
  revenue: number;

  @Column('text', { array: true })
  availableTimes: string[];

  @Column({ default: false })
  isActive: boolean;

  @Column({ unique: true, nullable: true })
  stripeAccountId: string;

  @Column({ default: false })
  isStripeAccountActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
