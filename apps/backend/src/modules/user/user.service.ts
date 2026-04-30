import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@dab/database';
import type { UpdateUserDto } from '@dab/backend/modules/user/dtos/update-user.dto';
import { MessageOutput, UserOutput } from '@dab/validation';
import { SupabaseService } from '../supabase/supabase.service';
import { createAnonClient } from '@dab/supabase';
import { EnvService } from '@dab/backend/modules/config/env.service';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Injectable()
export class UserService {
	logger = new Logger(UserService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		private readonly supabase: SupabaseService,
		private readonly env: EnvService,
	) { }

	async me(userId: string): Promise<UserOutput> {
		const [dbUser, { data: authData }] = await Promise.all([
			this.userRepo.findOne({
				where: { id: userId },
			}),
			this.supabase.admin.auth.admin.getUserById(userId),
		]);

		if (!dbUser) {
			throw new NotFoundException('User not found');
		}

		return {
			...dbUser,
			emailVerified: !!authData.user?.email_confirmed_at,
			email: authData.user?.email || '',
		};
	}

	async updateMe(userId: string, dto: UpdateUserDto): Promise<MessageOutput> {
		const updated = await this.userRepo
			.createQueryBuilder()
			.update(User)
			.set(dto)
			.where('id = :id', { id: userId })
			.returning('*')
			.execute();

		if (!updated) {
			throw new NotFoundException('User not found');
		}

		return { message: 'Profile updated successfully' };
	}

	async updateUserActivity(userId: string) {
		const user = await this.userRepo.findOne({ where: { id: userId } });
		if (!user) throw new NotFoundException('User not found');

		if (!user.isOnline) {
			throw new ForbiddenException("Cannot update an offline user's last active date");
		}

		await this.userRepo.update({ id: userId }, { isOnline: true, lastActiveAt: new Date() });

		return { message: 'User activity updated successfully' };
	}

	async deleteAccount(userId: string): Promise<MessageOutput> {
		const { error } = await this.supabase.admin.auth.admin.deleteUser(userId);

		if (error) {
			this.logger.error(`deleteAccount: failed to delete Supabase auth user ${userId}`, error);
			throw new InternalServerErrorException('Failed to delete account');
		}

		await this.userRepo.delete({ id: userId });

		return { message: 'Account deleted successfully' };
	}

	async changePassword(userId: string, dto: ChangePasswordDto): Promise<MessageOutput> {
		const { data: userData } = await this.supabase.admin.auth.admin.getUserById(userId);

		if (!userData.user?.email) {
			throw new NotFoundException('User not found');
		}

		const tempClient = createAnonClient({
			url: this.env.supabaseUrl,
			key: this.env.supabasePublishableKey,
		});

		const { error: verifyError } = await tempClient.auth.signInWithPassword({
			email: userData.user.email,
			password: dto.currentPassword,
		});

		await tempClient.auth.signOut();

		if (verifyError) {
			throw new UnauthorizedException('Current password is incorrect');
		}

		const { error: updateError } = await this.supabase.admin.auth.admin.updateUserById(userId, {
			password: dto.newPassword,
		});

		if (updateError) {
			this.logger.error(`changePassword: failed to update password for user ${userId}`, updateError);
			throw new InternalServerErrorException('Failed to change password');
		}

		// Invalidate all existing sessions for the user to force re-login with the new password
		await this.supabase.admin.auth.admin.signOut(userId);

		return { message: 'Password changed successfully. Please log in again.' };
	}
}
