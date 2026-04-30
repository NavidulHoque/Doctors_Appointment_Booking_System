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

export type MessageOutput = z.infer<typeof messageOutputSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type UserOutput = z.infer<typeof userOutputSchema>;