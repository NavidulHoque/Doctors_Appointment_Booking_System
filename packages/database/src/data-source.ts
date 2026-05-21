import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Doctor } from './entities/doctor.entity';
import { Appointment } from './entities/appointment.entity';
import { Payment } from './entities/payment.entity';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { Review } from './entities/review.entity';
import { DoctorWorkingDay } from './entities/doctor-working-day.entity';
import { DoctorBreakTime } from './entities/doctor-break-time.entity';

export const createDataSource = (url: string): DataSource =>
	new DataSource({
		type: 'postgres',
		url,
		synchronize: false,
		entities: [User, Doctor, Appointment, Payment, Message, Notification, Review, DoctorWorkingDay, DoctorBreakTime],
		migrations: ['dist/migrations/*.js'],
	});
