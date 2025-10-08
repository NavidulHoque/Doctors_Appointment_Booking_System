import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';
import { AuthHelperService } from '../auth-helper.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authHelper: AuthHelperService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException("No token provided, please login")
        }

        try {
            const payload = this.authHelper.verifyAccessToken(token)

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

    private extractToken(request: Request){

        if (request.cookies && request.cookies['access_token']) {
            return request.cookies['access_token'];
        }

        const authHeader = request.headers.authorization;
        if (authHeader) {
            const [type, token] = authHeader.split(' ');
            if (type === 'Bearer' && token) {
                return token;
            }
        }
    }
}