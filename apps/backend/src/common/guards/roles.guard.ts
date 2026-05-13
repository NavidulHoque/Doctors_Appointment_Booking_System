import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { ROLES_KEY } from '@dab/backend/common/decorators/roles.decorator';
import type { User } from '@dab/database';
import type { RoleType } from '@dab/shared';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(ctx: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
			ctx.getHandler(),
			ctx.getClass(),
		]);
		if (!requiredRoles?.length) return true;

		const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: User }>();
		const user = request.user;

		if (!requiredRoles.includes(user.role as RoleType)) {
			throw new ForbiddenException('You are not authorized to perform this action');
		}
		return true;
	}
}
