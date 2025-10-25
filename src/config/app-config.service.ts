import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './app.config';

@Injectable()
export class AppConfigService {
    constructor(private readonly config: ConfigService<AppConfig, true>) { }

    get databaseUrl(): string {
        return this.config.get('DATABASE_URL', { infer: true });
    }

    get port(): number {
        return this.config.get('PORT', { infer: true });
    }

    // JWT
    get accessTokenSecret(): string {
        return this.config.get('ACCESS_TOKEN_SECRET', { infer: true });
    }

    get refreshTokenSecret(): string {
        return this.config.get('REFRESH_TOKEN_SECRET', { infer: true });
    }

    get accessTokenExpires(): `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}` {
        return this.config.get('ACCESS_TOKEN_EXPIRES', { infer: true });
    }

    get refreshTokenExpires(): `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}` {
        return this.config.get('REFRESH_TOKEN_EXPIRES', { infer: true });
    }

    // Cloudinary
    get cloudinary() {
        return {
            cloudName: this.config.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
            apiKey: this.config.get('CLOUDINARY_API_KEY', { infer: true }),
            apiSecret: this.config.get('CLOUDINARY_API_SECRET', { infer: true }),
        };
    }

    // Redis
    get redis() {
        return {
            host: this.config.get('REDIS_HOST', { infer: true }),
            port: this.config.get('REDIS_PORT', { infer: true }),
            db: this.config.get('REDIS_DB', { infer: true }),
            ttlSeconds: this.config.get('REDIS_TTL_SECONDS', { infer: true }),
        };
    }

    // Stripe
    get stripe() {
        return {
            secretKey: this.config.get('STRIPE_SECRET_KEY', { infer: true }),
            webhookSecret: this.config.get('STRIPE_WEBHOOK_SECRET', { infer: true }),
        };
    }

    // SMTP
    get smtp() {
        return {
            host: this.config.get('SMTP_HOST', { infer: true }),
            port: this.config.get('SMTP_PORT', { infer: true }),
            user: this.config.get('SMTP_USER', { infer: true }),
            pass: this.config.get('SMTP_PASS', { infer: true }),
            from: this.config.get('SMTP_FROM', { infer: true }),
        };
    }

    // Twilio
    get twilio() {
        return {
            accountSid: this.config.get('TWILIO_ACCOUNT_SID', { infer: true }),
            authToken: this.config.get('TWILIO_AUTH_TOKEN', { infer: true }),
            phoneNumber: this.config.get('TWILIO_PHONE_NUMBER', { infer: true }),
        };
    }

    // Kafka
    get kafkaBroker(): string {
        return this.config.get('KAFKA_BROKER', { infer: true });
    }

    // Gemini
    get gemini() {
        return {
            apiKey: this.config.get('GEMINI_API_KEY', { infer: true }),
            model: this.config.get('GEMINI_MODEL', { infer: true }),
        };
    }
}
