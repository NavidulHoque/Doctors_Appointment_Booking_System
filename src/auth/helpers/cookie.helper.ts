import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TokenHelper } from "./token.helper";
import { Response } from 'express';
import { randomBytes } from 'crypto'

@Injectable()
export class CookieHelper {
    private readonly NODE_ENV: string;

    constructor(
        private readonly config: ConfigService,
        private readonly tokenHelper: TokenHelper
    ) {
        this.NODE_ENV = this.config.get<string>('NODE_ENV')!;
    }

    setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        const accessMaxAge = this.convertExpiryToMs(this.tokenHelper.ACCESS_TOKEN_EXPIRES);
        const refreshMaxAge = this.convertExpiryToMs(this.tokenHelper.REFRESH_TOKEN_EXPIRES);

        const cookieOpts = (maxAge: number, isHttpOnly = true) => ({
            httpOnly: isHttpOnly,
            secure: this.NODE_ENV === 'production',
            sameSite: this.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
            maxAge,
            path: '/'
        });

        res.cookie("access_token", accessToken, cookieOpts(accessMaxAge));
        res.cookie("refresh_token", refreshToken, cookieOpts(refreshMaxAge));

        const csrfToken = randomBytes(32).toString('hex');
        res.cookie('csrf_token', csrfToken, cookieOpts(refreshMaxAge, false));
        return
    }

    clearAuthCookies(res: Response) {
        const cookieOpts = {
            httpOnly: true,
            secure: this.NODE_ENV === 'production',
            sameSite: this.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
            path: '/', // frontend url where cookies are set
        };

        res.clearCookie('access_token', cookieOpts);
        res.clearCookie('refresh_token', cookieOpts);
        res.clearCookie('csrf_token', { ...cookieOpts, httpOnly: false });
        return
    }

    convertExpiryToMs(expiry: string) {
        const match = expiry.match(/(\d+)([smhdSMHD])/);
        if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: throw new Error(`Unsupported expiry unit: ${unit}`);
        }
    }
}
