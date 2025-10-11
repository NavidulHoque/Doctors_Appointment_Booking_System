import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayload, RefreshTokenPayload } from "../interfaces";

@Injectable()
export class TokenHelper {
    private readonly ACCESS_TOKEN_SECRET: string;
    private readonly REFRESH_TOKEN_SECRET: string;
    public readonly ACCESS_TOKEN_EXPIRES: string;
    public readonly REFRESH_TOKEN_EXPIRES: string;

    constructor(
        private readonly config: ConfigService,
        private readonly jwtService: JwtService,
    ) {
        this.ACCESS_TOKEN_EXPIRES = this.config.get<string>('ACCESS_TOKEN_EXPIRES')!;
        this.REFRESH_TOKEN_EXPIRES = this.config.get<string>('REFRESH_TOKEN_EXPIRES')!;
        this.ACCESS_TOKEN_SECRET = this.config.get<string>('ACCESS_TOKEN_SECRET')!;
        this.REFRESH_TOKEN_SECRET = this.config.get<string>('REFRESH_TOKEN_SECRET')!;
    }

    private generateToken(
        payload: Record<string, any>,
        type: 'access' | 'refresh'
    ) {
        const secret =
            type === 'access' ? this.ACCESS_TOKEN_SECRET : this.REFRESH_TOKEN_SECRET;
        const expiresIn =
            type === 'access' ? this.ACCESS_TOKEN_EXPIRES : this.REFRESH_TOKEN_EXPIRES;

        return this.jwtService.sign(payload, { secret, expiresIn });
    }

    private verifyToken(
        token: string,
        type: 'access' | 'refresh'
    ): AccessTokenPayload | RefreshTokenPayload {
        const secret =
            type === 'access' ? this.ACCESS_TOKEN_SECRET : this.REFRESH_TOKEN_SECRET;

        return this.jwtService.verify(token, { secret });
    }

    generateAccessToken(payload: AccessTokenPayload) {
        return this.generateToken(payload, 'access');
    }

    generateRefreshToken(payload: RefreshTokenPayload) {
        return this.generateToken(payload, 'refresh');
    }

    verifyAccessToken(accessToken: string): AccessTokenPayload {
        return this.verifyToken(accessToken, 'access');
    }

    verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
        return this.verifyToken(refreshToken, 'refresh') as RefreshTokenPayload;
    }
}
