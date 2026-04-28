import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User, Session } from '@dab/database';
import { Role } from '@dab/shared';
import type { RoleType } from '@dab/shared';
import { SupabaseService } from '@backend/modules/supabase/supabase.service';
import type { RegisterDto } from '@backend/modules/auth/dtos/register.dto';
import type { LoginDto } from '@backend/modules/auth/dtos/login.dto';
import type { ResetPasswordDto } from '@backend/modules/auth/dtos/reset-password.dto';
import type { RefreshTokenDto } from '@backend/modules/auth/dtos/refresh-token.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly supabase: SupabaseService,
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		@InjectRepository(Session)
		private readonly sessionRepo: Repository<Session>,
	) {}

	async register(dto: RegisterDto) {
		const existing = await this.userRepo.findOne({ where: { email: dto.email } });
		if (existing) throw new ConflictException('Email already registered');

		const hashedPassword = await argon2.hash(dto.password);

		const user = this.userRepo.create({
			fullName: dto.fullName,
			email: dto.email,
			password: hashedPassword,
			phone: dto.phone ?? null,
			gender: dto.gender ?? null,
			birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
			address: dto.address ?? null,
			role: Role.PATIENT,
			isOtpVerified: false,
		});
		await this.userRepo.save(user);

		// Create Supabase Auth user with the same UUID — Supabase sends OTP confirmation email
		const { error } = await this.supabase.admin.auth.admin.createUser({
			id: user.id, // sync Supabase user ID with DB user ID
			email: dto.email,
			password: dto.password,
			email_confirm: false,
		});

		if (error) {
			await this.userRepo.delete({ id: user.id });
			throw new BadRequestException(`Auth registration failed: ${error.message}`);
		}

		return {
			message: 'Registration successful. Please verify your email.',
			data: { id: user.id, email: user.email, fullName: user.fullName },
		};
	}

	async login(dto: LoginDto, allowedRole: RoleType) {
		const { data, error } = await this.supabase.anon.auth.signInWithPassword({
			email: dto.email,
			password: dto.password,
		});

		if (error || !data.user || !data.session) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const user = await this.userRepo.findOne({ where: { email: dto.email } });
		if (!user) throw new NotFoundException('User not found');

		if (user.role !== allowedRole) {
			throw new ForbiddenException(`This login endpoint is for ${allowedRole} accounts only`);
		}

		// Track session for device management
		await this.sessionRepo.save(
			this.sessionRepo.create({
				userId: user.id,
				deviceName: dto.deviceName ?? null,
				refreshToken: data.session.refresh_token,
				expiresAt: new Date(data.session.expires_at! * 1000),
			}),
		);

		await this.userRepo.update({ id: user.id }, { isOnline: true, lastActiveAt: new Date() });

		return {
			message: 'Login successful',
			data: {
				accessToken: data.session.access_token,
				refreshToken: data.session.refresh_token,
				user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
			},
		};
	}

	async patientLogin(dto: LoginDto) { return this.login(dto, Role.PATIENT as RoleType); }
	async doctorLogin(dto: LoginDto) { return this.login(dto, Role.DOCTOR as RoleType); }
	async adminLogin(dto: LoginDto) { return this.login(dto, Role.ADMIN as RoleType); }

	async forgotPassword(email: string) {
		const user = await this.userRepo.findOne({ where: { email } });
		if (!user) throw new NotFoundException('User not found');

		// Supabase sends the OTP/reset email natively
		const { error } = await this.supabase.anon.auth.resetPasswordForEmail(email);
		if (error) throw new BadRequestException(`Failed to send reset email: ${error.message}`);

		return { message: 'Password reset email sent. Please check your inbox.' };
	}

	async verifyOtp(email: string, token: string, type: 'signup' | 'recovery' | 'email' = 'email') {
		const { error } = await this.supabase.anon.auth.verifyOtp({ email, token, type });
		if (error) throw new BadRequestException(`OTP verification failed: ${error.message}`);

		await this.userRepo.update({ email }, { isOtpVerified: true });

		return { message: 'OTP verified successfully' };
	}

	async resetPassword(dto: ResetPasswordDto) {
		const user = await this.userRepo.findOne({
			where: { email: dto.email, isOtpVerified: true },
		});
		if (!user) throw new ForbiddenException('OTP verification required before resetting password');

		const hashedPassword = await argon2.hash(dto.newPassword);

		const { error } = await this.supabase.admin.auth.admin.updateUserById(user.id, {
			password: dto.newPassword,
		});
		if (error) throw new BadRequestException(`Failed to reset password: ${error.message}`);

		await this.userRepo.update(
			{ id: user.id },
			{ password: hashedPassword, isOtpVerified: false },
		);

		return { message: 'Password reset successfully' };
	}

	async refreshToken(dto: RefreshTokenDto) {
		const { data, error } = await this.supabase.anon.auth.refreshSession({
			refresh_token: dto.refreshToken,
		});

		if (error || !data.session) throw new UnauthorizedException('Invalid or expired refresh token');

		// Update stored session
		await this.sessionRepo.update(
			{ refreshToken: dto.refreshToken },
			{
				refreshToken: data.session.refresh_token,
				expiresAt: new Date(data.session.expires_at! * 1000),
			},
		);

		return {
			message: 'Token refreshed',
			data: {
				accessToken: data.session.access_token,
				refreshToken: data.session.refresh_token,
			},
		};
	}

	async logout(userId: string, refreshToken?: string) {
		if (refreshToken) {
			await this.sessionRepo.delete({ userId, refreshToken });
		} else {
			await this.sessionRepo.delete({ userId });
		}
		await this.userRepo.update({ id: userId }, { isOnline: false });

		return { message: 'Logged out successfully' };
	}
}
