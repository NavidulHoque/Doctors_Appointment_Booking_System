import { z } from 'zod';
import { genderSchema, otpTypeSchema } from './enums';

export const RegisterSchema = z.object({
	fullName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
	phone: z.string().optional(),
	gender: genderSchema.optional(),
	birthDate: z.string().date().optional(),
	address: z.string().optional(),
	deviceName: z.string().optional(),
});

export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	deviceName: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
	email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
	email: z.string().email(),
	newPassword: z.string().min(8),
});

export const VerifyOtpSchema = z.object({
	email: z.string().email(),
	token: z.string().min(1),
	type: otpTypeSchema.default('email'),
});

export const RefreshTokenSchema = z.object({
	refreshToken: z.string().min(1),
});

export type TRegister = z.infer<typeof RegisterSchema>;
export type TLogin = z.infer<typeof LoginSchema>;
export type TForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type TResetPassword = z.infer<typeof ResetPasswordSchema>;
export type TVerifyOtp = z.infer<typeof VerifyOtpSchema>;
export type TRefreshToken = z.infer<typeof RefreshTokenSchema>;
