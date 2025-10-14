import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        const method = request.method.toUpperCase();
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return true;
        }

        const csrfCookie = request.cookies['csrf_token'];
        const csrfHeader = request.headers['x-csrf-token'] || request.headers['x-xsrf-token'];

        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            throw new UnauthorizedException('Invalid CSRF token');
        }

        return true;
    }
}