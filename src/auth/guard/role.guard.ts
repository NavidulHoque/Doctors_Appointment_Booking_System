import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly handleErrorsService: HandleErrorsService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    const isAuthorizedRole = requiredRoles.includes(user.role)

    if (!isAuthorizedRole) {
      this.handleErrorsService.throwForbiddenError('You are not authorized to perform this action');
    }

    return isAuthorizedRole;
  }
}