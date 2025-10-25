import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './types';

@Injectable()
export class AppConfigService {
    constructor(private readonly config: ConfigService<AppConfig, true>) { }

    get jwt() {
        return {
            accessTokenSecret: this.config.get('ACCESS_TOKEN_SECRET', { infer: true }),
            refreshTokenSecret: this.config.get('REFRESH_TOKEN_SECRET', { infer: true }),
            accessTokenExpires: this.config.get('ACCESS_TOKEN_EXPIRES', { infer: true }),
            refreshTokenExpires: this.config.get('REFRESH_TOKEN_EXPIRES', { infer: true }),
        }
    }

    get cloudinary() {
        return {
            cloudName: this.config.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
            apiKey: this.config.get('CLOUDINARY_API_KEY', { infer: true }),
            apiSecret: this.config.get('CLOUDINARY_API_SECRET', { infer: true }),
        };
    }

    get otpExpires() {
        return this.config.get('OTP_EXPIRES', { infer: true });
    }

    get admin() {
        return {
            id: this.config.get('ADMIN_ID', { infer: true }),
            email: this.config.get('ADMIN_EMAIL', { infer: true }),
        };
    }

    get redis() {
        return {
            host: this.config.get('REDIS_HOST', { infer: true }),
            port: this.config.get('REDIS_PORT', { infer: true }),
            db: this.config.get('REDIS_DB', { infer: true }),
            ttlSeconds: this.config.get('REDIS_TTL_SECONDS', { infer: true }),
        };
    }

    get stripe() {
        return {
            secretKey: this.config.get('STRIPE_SECRET_KEY', { infer: true }),
            webhookSecret: this.config.get('STRIPE_WEBHOOK_SECRET', { infer: true }),
        };
    }

    get frontendUrl() {
        return this.config.get('FRONTEND_URL', { infer: true });
    }

    get kafkaBroker() {
        return this.config.get('KAFKA_BROKER', { infer: true });
    }

    get smtp() {
        return {
            host: this.config.get('SMTP_HOST', { infer: true }),
            port: this.config.get('SMTP_PORT', { infer: true }),
            user: this.config.get('SMTP_USER', { infer: true }),
            pass: this.config.get('SMTP_PASS', { infer: true }),
            from: this.config.get('SMTP_FROM', { infer: true }),
        };
    }

    get twilio() {
        return {
            accountSid: this.config.get('TWILIO_ACCOUNT_SID', { infer: true }),
            authToken: this.config.get('TWILIO_AUTH_TOKEN', { infer: true }),
            phoneNumber: this.config.get('TWILIO_PHONE_NUMBER', { infer: true }),
        };
    }

    get nodeEnv() {
        return this.config.get('NODE_ENV', { infer: true });
    }

    get gemini() {
        return {
            apiKey: this.config.get('GEMINI_API_KEY', { infer: true }),
            model: this.config.get('GEMINI_MODEL', { infer: true }),
            mcpSecret: this.config.get('MCP_SECRET', { infer: true })
        };
    }
}
