import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayload, RefreshTokenPayload } from "../interfaces";
import { AppConfigService } from "src/config";

@Injectable()
export class TokenHelper {

    constructor(
        private readonly config: AppConfigService,
        private readonly jwtService: JwtService,
    ) {}

    private generateToken(
        payload: Record<string, any>,
        type: 'access' | 'refresh'
    ) {
        const secret =
            type === 'access' ? this.config.jwt.accessTokenSecret : this.config.jwt.refreshTokenSecret;
        const expiresIn =
            type === 'access' ? this.config.jwt.accessTokenExpires : this.config.jwt.refreshTokenExpires;

        return this.jwtService.sign(payload, { secret, expiresIn });
    }

    private verifyToken(
        token: string,
        type: 'access' | 'refresh'
    ): AccessTokenPayload | RefreshTokenPayload {
        const secret =
            type === 'access' ? this.config.jwt.accessTokenSecret : this.config.jwt.refreshTokenSecret;

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
