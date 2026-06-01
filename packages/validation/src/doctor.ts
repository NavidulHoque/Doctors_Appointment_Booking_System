import { z } from 'zod';
import { weekDaysSchema } from './enums';
import { PaginationSchema } from './common';

export const CreateDoctorSchema = z.object({
	fullName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
	specialization: z.string().min(1),
	education: z.string().min(1),
	experience: z.number().int().min(0),
	aboutMe: z.string().min(1),
	fees: z.number().int().min(0),
	availableTimes: z.array(z.string()),
});

export const UpdateDoctorSchema = z.object({
	fullName: z.string().optional(),
	email: z.string().email().optional(),
	currentPassword: z.string().min(8).optional(),
	newPassword: z.string().min(8).optional(),
	specialization: z.string().optional(),
	education: z.string().optional(),
	experience: z.number().int().min(0).optional(),
	aboutMe: z.string().optional(),
	fees: z.number().int().min(0).optional(),
	isActive: z.boolean().optional(),
	addAvailableTime: z.string().optional(),
	removeAvailableTime: z.string().optional(),
});

const toArray = <T>(schema: z.ZodType<T>) =>
	z.preprocess((v) => {
		if (v === null || v === undefined) return undefined;
		return Array.isArray(v) ? v : [v];
	}, z.array(schema).optional());

export const QueryDoctorSchema = PaginationSchema.extend({
	search: z.string().optional(),
	specialization: toArray(z.string()),
	experience: toArray(z.coerce.number().int()),
	fees: toArray(z.coerce.number().int()),
	weekDays: toArray(weekDaysSchema)
});

const BreakTimeSchema = z.object({
	startTime: z.string(),
	endTime: z.string(),
});

const WorkingDayUpdateSchema = z.object({
	day: weekDaysSchema,
	startTime: z.string(),
	endTime: z.string(),
	isActive: z.boolean(),
	breakTime: BreakTimeSchema.nullable().optional(),
});

export const BulkUpdateWorkingDaysSchema = z.object({
	workingDays: z.array(WorkingDayUpdateSchema),
});

export type TCreateDoctor = z.infer<typeof CreateDoctorSchema>;
export type TUpdateDoctor = z.infer<typeof UpdateDoctorSchema>;
export type TQueryDoctor = z.infer<typeof QueryDoctorSchema>;
export type TBulkUpdateWorkingDays = z.infer<typeof BulkUpdateWorkingDaysSchema>;
