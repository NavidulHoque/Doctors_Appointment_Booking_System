import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { User } from '@dab/database';

export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): User => {
		const req = ctx.switchToHttp().getRequest<FastifyRequest & { user: User }>();
		return req.user;
	},
);
