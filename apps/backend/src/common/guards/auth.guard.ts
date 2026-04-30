import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '@dab/backend/common/decorators/public.decorator';
import { SupabaseService } from '@dab/backend/modules/supabase/supabase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@dab/database';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly supabase: SupabaseService,
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			ctx.getHandler(),
			ctx.getClass(),
		]);
		if (isPublic) return true;

		const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: User }>();
		const token = this.extractToken(request);

		if (!token) throw new UnauthorizedException('No token provided');

		const { data, error } = await this.supabase.admin.auth.getUser(token);
		if (error || !data.user) throw new UnauthorizedException('Invalid or expired token');

		const user = await this.userRepo.findOne({ where: { id: data.user.id } });
		if (!user) throw new UnauthorizedException('User not found');

		request.user = user;
		return true;
	}

	private extractToken(request: FastifyRequest): string | null {
		const header = request.headers['authorization'];
		if (!header?.startsWith('Bearer ')) return null;
		return header.slice(7);
	}
}
