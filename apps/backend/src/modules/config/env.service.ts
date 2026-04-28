import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '@backend/modules/config/env.schema';

@Injectable()
export class EnvService {
	constructor(private readonly config: ConfigService<Env, true>) {}

	get<T extends keyof Env>(key: T): Env[T] {
		return this.config.get(key, { infer: true });
	}

	get port(): number { return this.get('PORT'); }
	get nodeEnv(): string { return this.get('NODE_ENV'); }
	get isDevelopment(): boolean { return this.nodeEnv === 'development'; }
	get isProduction(): boolean { return this.nodeEnv === 'production'; }

	get supabaseUrl(): string { return this.get('SUPABASE_URL'); }
	get supabasePublishableKey(): string { return this.get('SUPABASE_PUBLISHABLE_KEY'); }
	get supabaseSecretKey(): string { return this.get('SUPABASE_SECRET_KEY'); }

	get databaseUrl(): string { return this.get('DATABASE_URL'); }
	get corsOrigin(): string | undefined { return this.get('CORS_ORIGIN'); }

	get stripe() {
		return {
			secretKey: this.get('STRIPE_SECRET_KEY'),
			webhookSecret: this.get('STRIPE_WEBHOOK_SECRET'),
		};
	}

	get adminEmail(): string { return this.get('ADMIN_EMAIL'); }
	get adminId(): string { return this.get('ADMIN_ID'); }

	get smtp() {
		return {
			host: this.get('SMTP_HOST'),
			port: this.get('SMTP_PORT'),
			user: this.get('SMTP_USER'),
			pass: this.get('SMTP_PASS'),
			from: this.get('SMTP_FROM'),
		};
	}

	get otpExpiryMinutes(): number { return this.get('OTP_EXPIRY_MINUTES'); }
	get frontendUrl(): string | undefined { return this.get('FRONTEND_URL'); }
}
