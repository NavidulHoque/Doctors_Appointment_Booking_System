import { AppointmentStatus } from '@dab/shared';
import { z } from 'zod';

// ─── Common ───────────────────────────────────────────────────────────────────

export const messageOutputSchema = z.object({
	message: z.string(),
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authUserSchema = z.object({
	id: z.string(),
	email: z.string(),
	fullName: z.string(),
	emailVerified: z.boolean(),
});

export const authSessionSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	expiresIn: z.number(),
	expiresAt: z.number(),
	user: authUserSchema,
});

// ─── Users ────────────────────────────────────────────────────────────────────

export const userOutputSchema = z.object({
	id: z.string(),
	email: z.string(),
	fullName: z.string(),
	emailVerified: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// ─── Appointments ──────────────────────────────────────────────────────────────────

export const appointmentOutputSchema = z.object({
	id: z.string(),
	patientId: z.string(),
	doctorId: z.string(),
	date: z.string(),
	status: z.enum([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.RUNNING]),
	cancellationReason: z.string().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const createAppointmentResponseSchema = messageOutputSchema.merge(appointmentOutputSchema);

export const appointmentCountOutputSchema = messageOutputSchema.extend({
	count: z.object({
		totalAppointments: z.number(),

		totalUniquePatientsCount: z.number(),
		totalUniqueDoctorsCount: z.number(),

		totalPendingAppointments: z.number(),
		totalConfirmedAppointments: z.number(),
		totalRunningAppointments: z.number(),
		totalCompletedAppointments: z.number(),
		totalCancelledAppointments: z.number(),

		totalPaidAppointments: z.number(),
		totalUnPaidAppointments: z.number(),

		totalCashPaidAppointments: z.number(),
		totalOnlinePaidAppointments: z.number(),
	})
});

export const appointmentGraphOutputSchema = z.object({
	year: z.number(),
	month: z.string(),
	total: z.number(),
});

// ─── Doctors ───────────────────────────────────────────────────────────────────

export const doctorOutputSchema = z.object({
	id: z.string(),
	fullName: z.string(),
	email: z.string(),
	specialization: z.string(),
	education: z.string(),
});

export type MessageOutput = z.infer<typeof messageOutputSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type UserOutput = z.infer<typeof userOutputSchema>;
export type AppointmentOutput = z.infer<typeof appointmentOutputSchema>;
export type DoctorOutput = z.infer<typeof doctorOutputSchema>;
export type AppointmentCountOutput = z.infer<typeof appointmentCountOutputSchema>;
export type AppointmentGraphOutput = z.infer<typeof appointmentGraphOutputSchema>;