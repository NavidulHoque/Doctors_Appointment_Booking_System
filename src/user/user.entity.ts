import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role, Gender, Global } from 'src/common/enums';
import { Doctor } from 'src/doctor'; 
import { Message } from 'src/message';
import { Appointment } from 'src/appointment';
import { Review } from 'src/review';
import { Notification } from 'src/notification';
import { Payment } from 'src/payment';
import { UuidBaseEntity } from 'src/common/entities';

@Entity({ name: Global.USERS, schema: Global.SCHEMA })
export class User extends UuidBaseEntity {
  @Column({ type: 'varchar', name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', name: 'email', unique: true })
  email: string;

  @Column({ type: 'enum', enum: Role, default: Role.PATIENT })
  role: Role;

  @Column({ type: 'varchar', name: 'phone', nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'timestamp', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', name: 'address', nullable: true })
  address: string;

  @Column({ type: 'varchar', name: 'password' })
  password: string;

  @Column({ type: 'varchar', name: 'avatar_image', nullable: true })
  avatarImage: string;

  @Column({ type: 'boolean', name: 'is_online', default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', name: 'last_active_at', nullable: true })
  lastActiveAt: Date;

  @Column({ type: 'varchar', name: 'otp', nullable: true })
  otp: string;

  @Column({ type: 'timestamp', name: 'otp_expires', nullable: true })
  otpExpires: Date;

  @Column({ type: 'boolean', name: 'is_otp_verified', default: false })
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
}
