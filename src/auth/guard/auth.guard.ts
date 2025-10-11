import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { TokenHelper } from '../helpers/token.helper';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly tokenHelper: TokenHelper
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException("No token provided, please login")
        }

        try {
            const payload = this.tokenHelper.verifyAccessToken(token)

            request['user'] = payload;
        }

        catch (error) {

            switch (error.name) {

                case "TokenExpiredError":
                    throw new UnauthorizedException("Token expired, please login again");

                case "JsonWebTokenError":
                    throw new UnauthorizedException("Invalid token, please login again");

                case "NotBeforeError":
                    throw new UnauthorizedException("Token not active yet, please login again");

                default:
                    throw error;
            }
        }

        return true
    }

    private extractToken(request: Request) {

        if (request.cookies && request.cookies['access_token']) {
            return request.cookies['access_token'];
        }

        const authHeader = request.headers.authorization;
        const parts = authHeader?.split(/\s+/).filter(Boolean);
        if (parts?.length !== 2) {
            throw new UnauthorizedException("Invalid authorization header format")
        };

        const [type, token] = parts;
        if (type.toLowerCase() !== 'bearer') {
            throw new UnauthorizedException("Invalid authorization header type")
        };
        
        return token;
    }
}