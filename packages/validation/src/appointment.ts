import { z } from 'zod';
import { appointmentStatusSchema } from './enums';
import { PaginationSchema } from './common';

export const CreateAppointmentSchema = z.object({
	patientId: z.string().uuid(),
	doctorId: z.string().uuid(),
	date: z.string().datetime(),
});

export const UpdateAppointmentSchema = z.object({
	status: appointmentStatusSchema.optional(),
	cancellationReason: z.string().optional(),
});

export const QueryAppointmentSchema = PaginationSchema.extend({
	status: appointmentStatusSchema.optional(),
	search: z.string().optional(),
	date: z.string().date().optional(),
	isToday: z.coerce.boolean().optional(),
	isPast: z.coerce.boolean().optional(),
	isFuture: z.coerce.boolean().optional(),
});

export type TCreateAppointment = z.infer<typeof CreateAppointmentSchema>;
export type TUpdateAppointment = z.infer<typeof UpdateAppointmentSchema>;
export type TQueryAppointment = z.infer<typeof QueryAppointmentSchema>;
