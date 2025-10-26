import { Injectable } from "@nestjs/common";
import { Response } from 'express';
import { randomBytes } from 'crypto'
import { AppConfigService } from "src/config";

@Injectable()
export class CookieHelper {
    constructor(
        private readonly config: AppConfigService
    ) { }

    setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        const accessMaxAge = this.convertExpiryToMs(this.config.jwt.accessTokenExpires);
        const refreshMaxAge = this.convertExpiryToMs(this.config.jwt.refreshTokenExpires);

        const accessOpts = this.cookieOpts(accessMaxAge);
        const refreshOpts = this.cookieOpts(refreshMaxAge);
        const csrfOpts = this.cookieOpts(refreshMaxAge, false);

        res.cookie("access_token", accessToken, accessOpts);
        res.cookie("refresh_token", refreshToken, refreshOpts);

        const csrfToken = randomBytes(32).toString('hex');
        res.cookie('csrf_token', csrfToken, csrfOpts);
    }

    clearAuthCookies(res: Response) {
        const accessOpts = this.cookieOpts();
        const refreshOpts = this.cookieOpts();
        const csrfOpts = this.cookieOpts(undefined, false);

        res.clearCookie('access_token', accessOpts);
        res.clearCookie('refresh_token', refreshOpts);
        res.clearCookie('csrf_token', csrfOpts);
    }

    convertExpiryToMs(expiry: string) {
        const match = expiry.match(/(\d+)([smhd])/i);
        if (!match) throw new Error(`Invalid expiry format: ${expiry}`);
        const value = Number(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: throw new Error(`Unsupported expiry unit: ${unit}`);
        }
    }

    private cookieOpts(maxAge?: number | undefined, isHttpOnly = true) {
        return {
            httpOnly: isHttpOnly,
            secure: this.config.nodeEnv === 'production',
            sameSite: this.config.nodeEnv === 'production' ? 'none' as const : 'lax' as const,
            maxAge,
            path: '/'
        }
    };
}
