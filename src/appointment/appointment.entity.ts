import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Status, Method } from 'src/common/enums';
import { Payment } from '../payment/payment.entity';

@Entity()
@Unique(['doctorId', 'date'])
@Unique(['patientId', 'date'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.patientAppointments)
  @JoinColumn({ name: 'patientId' })
  patient: User;

  @Column()
  patientId: string;

  @ManyToOne(() => User, user => user.doctorAppointments)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column()
  doctorId: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @Column({ default: '' })
  cancellationReason: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'enum', enum: Method, nullable: true })
  paymentMethod: Method;

  @OneToOne(() => Payment, p => p.appointment)
  onlinePayment: Payment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
