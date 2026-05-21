export const Role = {
	PATIENT: 'PATIENT',
	DOCTOR: 'DOCTOR',
	ADMIN: 'ADMIN',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export const Gender = {
	MALE: 'MALE',
	FEMALE: 'FEMALE',
	OTHER: 'OTHER',
} as const;

export type GenderType = (typeof Gender)[keyof typeof Gender];

export const AppointmentStatus = {
	PENDING: 'PENDING',
	CONFIRMED: 'CONFIRMED',
	RUNNING: 'RUNNING',
	COMPLETED: 'COMPLETED',
	CANCELLED: 'CANCELLED',
} as const;

export type AppointmentStatusType = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const PaymentMethod = {
	CASH: 'CASH',
	ONLINE: 'ONLINE',
} as const;

export type PaymentMethodType = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
	PENDING: 'PENDING',
	COMPLETED: 'COMPLETED',
} as const;

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const WeekDays = {
	MONDAY: 'monday',
	TUESDAY: 'tuesday',
	WEDNESDAY: 'wednesday',
	THURSDAY: 'thursday',
	FRIDAY: 'friday',
	SATURDAY: 'saturday',
	SUNDAY: 'sunday',
} as const;

export type WeekDaysType = (typeof WeekDays)[keyof typeof WeekDays];

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export type MessageStatusType = (typeof MessageStatus)[keyof typeof MessageStatus];