import { z } from 'zod';

export const appConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(5000),

  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES: z.string().regex(/^\d+[smhdwy]$/), // e.g. 7d, 15m, 30d
  REFRESH_TOKEN_EXPIRES: z.string().regex(/^\d+[smhdwy]$/),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  OTP_EXPIRES: z.coerce.number(),

  ADMIN_ID: z.string().uuid(),
  ADMIN_EMAIL: z.string().email(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_DB: z.coerce.number(),
  REDIS_TTL_SECONDS: z.coerce.number(),

  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),

  FRONTEND_URL: z.string().url(),

  KAFKA_BROKER: z.string(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string().email(),

  TWILIO_ACCOUNT_SID: z.string(),
  TWILIO_AUTH_TOKEN: z.string(),
  TWILIO_PHONE_NUMBER: z.string(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  GEMINI_API_KEY: z.string(),
  GEMINI_MODEL: z.string(),
  MCP_SECRET: z.string(),
});

export type AppConfig = z.infer<typeof appConfigSchema>;
