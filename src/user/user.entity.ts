import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role, Gender } from 'src/common/enums';
import { Doctor } from 'src/doctor'; 
import { Message } from 'src/message';
import { Appointment } from 'src/appointment';
import { Review } from 'src/review';
import { Notification } from 'src/notification';
import { Payment } from 'src/payment';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: Role, default: Role.PATIENT })
  role: Role;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'timestamp', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  address: string;

  @Column()
  password: string;

  @Column({ default: '' })
  avatarImage: string;

  @Column({ default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date;

  @Column({ nullable: true })
  otp: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpires: Date;

  @Column({ default: false })
  isOtpVerified: boolean;

  @OneToOne(() => Doctor, doctor => doctor.user)
  doctor: Doctor;

  @OneToMany(() => Message, msg => msg.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, msg => msg.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Appointment, appointment => appointment.patient)
  patientAppointments: Appointment[];

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  doctorAppointments: Appointment[];

  @OneToMany(() => Review, review => review.patient)
  patientReviews: Review[];

  @OneToMany(() => Review, review => review.doctor)
  doctorReviews: Review[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Payment, payment => payment.user)
  onlinePayments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
