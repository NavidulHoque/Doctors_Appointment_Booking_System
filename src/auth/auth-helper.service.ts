import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { Response } from 'express';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User as PrismaUser } from '@prisma/client';
import { randomInt } from 'crypto'

@Injectable()
export class AuthHelperService {
    private readonly logger = new Logger(AuthHelperService.name);

    // Environment variables
    private readonly ACCESS_TOKEN_EXPIRES: string;
    public readonly REFRESH_TOKEN_EXPIRES: string;
    private readonly ACCESS_TOKEN_SECRET: string;
    private readonly REFRESH_TOKEN_SECRET: string;
    public readonly OTP_EXPIRES: number;
    private readonly NODE_ENV: string;

    private readonly userSelect: Prisma.UserSelect = {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        password: true,
        otp: true,
        otpExpires: true,
        isOtpVerified: true
    }

    constructor(
        private readonly config: ConfigService,
        private readonly jwtService: JwtService,
        private readonly email: EmailService,
        private readonly prisma: PrismaService,
    ) {
        this.ACCESS_TOKEN_EXPIRES = this.config.get<string>('ACCESS_TOKEN_EXPIRES')!;
        this.REFRESH_TOKEN_EXPIRES = this.config.get<string>('REFRESH_TOKEN_EXPIRES')!;
        this.ACCESS_TOKEN_SECRET = this.config.get<string>('ACCESS_TOKEN_SECRET')!;
        this.REFRESH_TOKEN_SECRET = this.config.get<string>('REFRESH_TOKEN_SECRET')!;
        this.OTP_EXPIRES = Number(this.config.get<string>('OTP_EXPIRES'));
        this.NODE_ENV = this.config.get<string>('NODE_ENV')!;
    }

    /** ----------------------
     * TOKEN METHODS
     * ---------------------- */
    private generateToken(
        payload: Record<string, any>,
        type: 'access' | 'refresh'
    ): string {
        const secret =
            type === 'access' ? this.ACCESS_TOKEN_SECRET : this.REFRESH_TOKEN_SECRET;
        const expiresIn =
            type === 'access' ? this.ACCESS_TOKEN_EXPIRES : this.REFRESH_TOKEN_EXPIRES;

        return this.jwtService.sign(payload, { secret, expiresIn });
    }

    private verifyToken(token: string, type: 'access' | 'refresh') {
        const secret =
            type === 'access' ? this.ACCESS_TOKEN_SECRET : this.REFRESH_TOKEN_SECRET;

        return this.jwtService.verify(token, { secret });
    }

    generateAccessToken(payload: { id: string; role: string; email: string }) {
        return this.generateToken(payload, 'access');
    }

    generateRefreshToken(payload: {
        id: string;
        role: string;
        email: string;
        sessionId: string;
    }) {
        return this.generateToken(payload, 'refresh');
    }

    verifyAccessToken(accessToken: string) {
        return this.verifyToken(accessToken, 'access');
    }

    verifyRefreshToken(refreshToken: string) {
        return this.verifyToken(refreshToken, 'refresh');
    }

    decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

    /** ----------------------
     * CRYPTO METHODS
     * ---------------------- */
    async hashValue(value: string) {
        return await argon.hash(value);
    }

    async verifyHash(hashed: string, plainValue: string) {
        return await argon.verify(hashed, plainValue);
    }

    /** ----------------------
     * OTP METHODS
     * ---------------------- */
    async generateOtp() {
        const otp = randomInt(100000, 1000000).toString(); // 6 digit OTP
        const hashedOtp = await this.hashValue(otp);
        return { otp, hashedOtp };
    }

    getOtpExpiryDate() {
        return new Date(Date.now() + this.OTP_EXPIRES * 60 * 1000);
    }

    /** ----------------------
     * COOKIE METHODS
     * ---------------------- */
    setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
        const accessMaxAge = this.convertExpiryToMs(this.ACCESS_TOKEN_EXPIRES);
        const refreshMaxAge = this.convertExpiryToMs(this.REFRESH_TOKEN_EXPIRES);

        const cookieOpts = (maxAge: number) => ({
            httpOnly: true,
            secure: this.NODE_ENV === 'production',
            sameSite: this.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
            maxAge
        });

        res.cookie("access_token", accessToken, cookieOpts(accessMaxAge));
        res.cookie("refresh_token", refreshToken, cookieOpts(refreshMaxAge));
    }

    clearAuthCookies(res: Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
    }

    /** ----------------------
     * SESSION METHODS
     * ---------------------- */
    async findSessionById<T extends Prisma.SessionSelect>(
        sessionId: string,
        select: T,
    ): Promise<Prisma.SessionGetPayload<{ select: T }>> {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            select,
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return session;
    }

    async deleteSession(sessionId: string) {
        await this.prisma.session.delete({
            where: { id: sessionId }
        })
    }

    /** ----------------------
     * USER METHODS
     * ---------------------- */
    async fetchUserByEmail(email: string, errorMessage: string) {

        const user = await this.prisma.user.findUnique({
            where: { email },
            select: this.userSelect
        });

        if (!user) {
            throw new BadRequestException(errorMessage);
        }

        return user;
    }

    /** ----------------------
     * UTILITY METHODS
     * ---------------------- */
    convertExpiryToMs(expiry: string) {
        const match = expiry.match(/(\d+)([smhd])/);
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

    /** ----------------------
     * HANDLER METHODS
     * ---------------------- */
    async handleNotificationFailure(
        actionDescription: string,
        error: Error,
        user: Pick<PrismaUser, 'id' | 'email'>,
        traceId: string
    ) {
        this.logger.error(`❌ Failed to ${actionDescription}, Reason: ${error.message} with traceId=${traceId}`);

        try {
            await this.email.alertAdmin(
                `Failed to ${actionDescription}`,
                `Failed to ${actionDescription} userId=${user.id}, email=${user.email}, Reason: ${error.message} with traceId=${traceId}`
            );
        } catch (adminError) {
            this.logger.error(`❌ Failed to alert admin. Reason: ${adminError.message} with traceId=${traceId}`);
        }
    }
}