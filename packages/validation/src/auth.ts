import { z } from 'zod';

export const registerSchema = z.object({
	fullName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
	email: z.string().email(),
});

export const resetPasswordSchema = z.object({
	password: z.string().min(8),
});

export const getOAuthUrlSchema = z.object({
	provider: z.enum(['google']),
	redirectTo: z.string().url(),
});

export const exchangeOAuthSessionSchema = z.object({
	accessToken: z.string().min(1),
	refreshToken: z.string().min(1),
});

export const resendConfirmationSchema = z.object({
	email: z.string().email(),
});

export const logoutSchema = z.object({
	token: z.string().min(1),
});
