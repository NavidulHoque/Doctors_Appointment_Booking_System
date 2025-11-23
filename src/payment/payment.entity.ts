import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user';
import { Appointment } from 'src/appointment';
import { PaymentStatus } from 'src/common/enums';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, u => u.onlinePayments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToOne(() => Appointment, a => a.onlinePayment)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ unique: true })
  appointmentId: string;

  @Column('float')
  amount: number;

  @Column({ unique: true })
  transactionId: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
}
