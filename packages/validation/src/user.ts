import { z } from 'zod';
import { genderSchema } from './enums';

export const UpdateUserSchema = z.object({
	fullName: z.string().optional(),
	phone: z.string().optional(),
	gender: genderSchema.optional(),
	birthDate: z.string().date().optional(),
	address: z.string().optional(),
});

export type TUpdateUser = z.infer<typeof UpdateUserSchema>;
