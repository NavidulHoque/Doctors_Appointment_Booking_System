import { z } from 'zod';

export const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.coerce.number().default(3000),

	SUPABASE_URL: z.string().url(),
	SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
	SUPABASE_SECRET_KEY: z.string().min(1),

	DATABASE_URL: z.string().min(1),

	CORS_ORIGIN: z.string().optional(),

	STRIPE_SECRET_KEY: z.string().min(1),
	STRIPE_WEBHOOK_SECRET: z.string().min(1),

	ADMIN_EMAIL: z.string().email(),
	ADMIN_ID: z.string().min(1),

	SMTP_HOST: z.string().min(1),
	SMTP_PORT: z.coerce.number().default(587),
	SMTP_USER: z.string().min(1),
	SMTP_PASS: z.string().min(1),
	SMTP_FROM: z.string().min(1),

	OTP_EXPIRY_MINUTES: z.coerce.number().default(10),

	FRONTEND_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;
