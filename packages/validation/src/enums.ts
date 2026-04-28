import { z } from 'zod';
import { AppointmentStatus, Gender, PaymentMethod, PaymentStatus, WeekDays } from '@dab/shared';

export const appointmentStatusSchema = z.enum([
	AppointmentStatus.PENDING,
	AppointmentStatus.CONFIRMED,
	AppointmentStatus.RUNNING,
	AppointmentStatus.COMPLETED,
	AppointmentStatus.CANCELLED,
]);

export const genderSchema = z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]);

export const paymentStatusSchema = z.enum([PaymentStatus.PENDING, PaymentStatus.COMPLETED]);

export const paymentMethodSchema = z.enum([PaymentMethod.CASH, PaymentMethod.ONLINE]);

export const otpTypeSchema = z.enum(['signup', 'recovery', 'email']);

export const weekDaysSchema = z.enum([
	WeekDays.MONDAY,
	WeekDays.TUESDAY,
	WeekDays.WEDNESDAY,
	WeekDays.THURSDAY,
	WeekDays.FRIDAY,
	WeekDays.SATURDAY,
	WeekDays.SUNDAY,
]);
