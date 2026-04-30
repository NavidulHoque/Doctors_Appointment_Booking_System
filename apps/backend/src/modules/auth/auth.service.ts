import { Injectable, Logger, BadRequestException, UnauthorizedException, ConflictException, InternalServerErrorException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { SupabaseService } from '@dab/backend/modules/supabase/supabase.service';
import { AuthError, createAnonClient } from '@dab/supabase';
import { EnvService } from '../config/env.service';
import { MessageOutput, AuthSession } from '@dab/validation';
import { ThrottlerException } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResendConfirmationEmailDto } from './dtos/resend-confirmation-email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { GetOAuthUrlDto } from './dtos/get-oauth-url.dto';
import { ExchangeOAuthSessionDto } from './dtos/exchange-oauth-session.dto';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly env: EnvService,
		private readonly supabase: SupabaseService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@Inject(DataSource)
		private readonly dataSource: DataSource
	) { }

	async register(dto: RegisterDto): Promise<MessageOutput> {
		const { fullName, email, password } = dto;

		// 1. Create auth user — email not confirmed yet.
		const { data, error } = await this.supabase.admin.auth.admin.createUser({
			email,
			password,
			email_confirm: false,
			user_metadata: { fullName },
		});

		if (error) {
			switch (error.code) {
				case 'email_exists':
				case 'user_already_exists':
					throw new ConflictException('An account with this email already exists');
				case 'weak_password':
					throw new BadRequestException('Password is too weak — use at least 8 characters');
				case 'email_address_invalid':
					throw new BadRequestException('Invalid email address');
				case 'over_email_send_rate_limit':
					throw new ThrottlerException('Too many requests, please try again later');
				default:
					this.logger.error(`[register] createUser failed [${error.code}]`, error);
					throw new InternalServerErrorException('Failed to create account');
			}
		}

		const userId = data.user.id;

		// 2. Insert user profile — roll back the auth user if this fails.
		try {
			await this.createProfile(userId, fullName);
		} catch (err) {
			this.logger.error(`[register] db insert failed for auth user ${userId}`, err);

			try {
				await this.supabase.admin.auth.admin.deleteUser(userId);
			} catch (rollbackErr) {
				this.logger.error(
					`[register] rollback deleteUser failed for ${userId} — manual cleanup required`,
					rollbackErr,
				);
			}

			throw new InternalServerErrorException('Failed to create user profile');
		}

		// 3. Send verification email via Supabase's built-in email service.
		const resendError = await this.sendSupabaseEmail(email);

		if (resendError) {
			this.logger.error(`[register] failed to send verification email`, resendError);
		}

		return { message: 'Check your email to confirm your account' };
	}

	async login(dto: LoginDto): Promise<AuthSession> {
		const tempClient = createAnonClient({
			url: this.env.supabaseUrl,
			key: this.env.supabasePublishableKey,
		});

		const { data, error } = await tempClient.auth.signInWithPassword({
			email: dto.email,
			password: dto.password,
		});

		if (error) {
			if (error.code === 'email_not_confirmed') {
				throw new ForbiddenException('Please verify your email before logging in');
			}
			throw new UnauthorizedException('Invalid email or password');
		}

		const { session, user } = data;

		// local safety net — catches cases where Supabase email confirmation enforcement is disabled.
		if (!user.email_confirmed_at) {
			throw new ForbiddenException('Please verify your email before logging in');
		}

		// Fetch user profile from database
		const profile = await this.userRepository.findOne({
			where: { id: user.id },
			select: ['fullName'],
		});

		if (!profile) {
			this.logger.error(`login: no user profile for auth user ${user.id}`);
			throw new NotFoundException('User profile not found');
		}

		return {
			accessToken: session.access_token,
			refreshToken: session.refresh_token,
			expiresIn: session.expires_in,
			expiresAt: session.expires_at!,
			user: {
				id: user.id,
				email: user.email || '',
				fullName: profile.fullName,
				emailVerified: !!user.email_confirmed_at,
			},
		};
	}

	async logout(token: string): Promise<MessageOutput> {
		// admin.signOut takes the user's JWT, not their UUID
		const { error } = await this.supabase.admin.auth.admin.signOut(token);

		if (error) {
			this.logger.error('logout signOut failed', error);
			throw new InternalServerErrorException('Failed to log out');
		}

		return { message: 'Logged out successfully' };
	}

	async refreshToken(dto: RefreshTokenDto): Promise<AuthSession> {
		// use a temp anon client so the service-role admin client state is not touched
		const tempClient = createAnonClient({
			url: this.env.supabaseUrl,
			key: this.env.supabasePublishableKey,
		});

		const { data, error } = await tempClient.auth.refreshSession({
			refresh_token: dto.refreshToken,
		});

		if (error || !data.session || !data.user) {
			throw new UnauthorizedException('Invalid or expired refresh token');
		}

		const { session, user } = data;

		const profile = await this.userRepository.findOne({
			where: { id: user.id },
			select: ['fullName'],
		});

		if (!profile) {
			this.logger.error(`refreshToken: no user profile for auth user ${user.id}`);
			throw new NotFoundException('User profile not found');
		}

		return {
			accessToken: session.access_token,
			refreshToken: session.refresh_token,
			expiresIn: session.expires_in,
			expiresAt: session.expires_at || 0,
			user: {
				id: user.id,
				email: user.email || '',
				fullName: profile.fullName,
				emailVerified: !!user.email_confirmed_at
			},
		};
	}

	async forgotPassword(dto: ForgotPasswordDto): Promise<MessageOutput> {
		const tempClient = createAnonClient({
			url: this.env.supabaseUrl,
			key: this.env.supabasePublishableKey,
		});

		// resetPasswordForEmail triggers Supabase's built-in password reset email.
		const { error } = await tempClient.auth.resetPasswordForEmail(dto.email);

		if (error) {
			if (error.code === 'over_email_send_rate_limit') {
				throw new ThrottlerException('Too many requests, please try again later');
			}
			this.logger.error('[forgot-password] resetPasswordForEmail failed', error);
		}

		// always return success — never reveal whether the email exists.
		return { message: 'If an account with that email exists, a password reset link has been sent' };
	}

	async resendConfirmation(dto: ResendConfirmationEmailDto): Promise<MessageOutput> {
		// step 1: bail out if already verified — no need to send another email.
		const row = await this.dataSource
			.createQueryBuilder()
			.select('users.email_confirmed_at', 'email_confirmed_at')
			.from('auth.users', 'users')
			.where('users.email = :email', { email: dto.email })
			.limit(1)
			.getRawOne<{ email_confirmed_at: string | null }>();

		if (row?.email_confirmed_at) {
			return { message: 'Email already verified' };
		}

		// step 2: resend via Supabase's built-in email service.
		const error = await this.sendSupabaseEmail(dto.email);

		if (error) {
			if (error.code === 'over_email_send_rate_limit') {
				throw new ThrottlerException('Too many requests, please try again later');
			}
			this.logger.error('[resend-confirmation] resend failed', error);
			throw new InternalServerErrorException('Failed to resend confirmation');
		}

		return { message: 'Confirmation email sent successfully' };
	}

	async resetPassword(userId: string, dto: ResetPasswordDto): Promise<MessageOutput> {
		const { error } = await this.supabase.admin.auth.admin.updateUserById(userId, {
			password: dto.password,
		});

		if (error) {
			this.logger.error(`resetPassword: failed for user ${userId}`, error);
			throw new InternalServerErrorException('Failed to reset password');
		}

		return { message: 'Password reset successfully' };
	}

	getOAuthUrl(dto: GetOAuthUrlDto): { url: string } {
		const url = new URL(`${this.env.supabaseUrl}/auth/v1/authorize`);
		url.searchParams.set('provider', dto.provider);
		url.searchParams.set('redirect_to', dto.redirectTo);
		url.searchParams.set('flow_type', 'implicit');
		return { url: url.toString() };
	}

	async exchangeOAuthSession(dto: ExchangeOAuthSessionDto): Promise<AuthSession> {
		const tempClient = createAnonClient({
			url: this.env.supabaseUrl,
			key: this.env.supabasePublishableKey,
		});

		const { data, error } = await tempClient.auth.setSession({
			access_token: dto.accessToken,
			refresh_token: dto.refreshToken,
		});

		if (error || !data.session || !data.user) {
			throw new UnauthorizedException('Invalid or expired OAuth session');
		}

		const { session, user } = data;

		// Auto provision a DB profile on first Google sign-in
		let profile = await this.userRepository.findOne({
			where: { id: user.id },
			select: { fullName: true },
		});

		if (!profile) {
			const fullName =
				(user.user_metadata?.full_name) ||
				(user.user_metadata?.name) ||
				user.email?.split('@')[0] ||
				'Unknown';

			await this.createProfile(user.id, fullName);

			profile = { fullName } as User;
		}

		return {
			accessToken: session.access_token,
			refreshToken: session.refresh_token,
			expiresIn: session.expires_in,
			expiresAt: session.expires_at!,
			user: {
				id: user.id,
				email: user.email!,
				fullName: profile.fullName,
				emailVerified: !!user.email_confirmed_at,
			},
		};
	}

	private async sendSupabaseEmail(email: string): Promise<AuthError | null> {
		const tempClient = createAnonClient({
			url: this.env.supabaseUrl,
			key: this.env.supabasePublishableKey,
		});

		const { error } = await tempClient.auth.resend({
			type: 'signup',
			email,
		});

		return error;
	}

	private async createProfile(userId: string, fullName: string): Promise<void> {
		await this.userRepository.insert({
			id: userId,
			fullName,
		});
	}
}
