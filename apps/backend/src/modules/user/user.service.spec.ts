import {
	ForbiddenException,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { UserService } from '@dab/backend/modules/user/user.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EnvService } from '@dab/backend/modules/config/env.service';
import * as supabaseClient from '@dab/supabase';

const mockRepo = () => ({
	findOne: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	createQueryBuilder: jest.fn(() => ({
		update: jest.fn().mockReturnThis(),
		set: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		returning: jest.fn().mockReturnThis(),
		execute: jest.fn(),
	})),
});

const mockSupabase = () => ({
	admin: {
		auth: {
			admin: {
				getUserById: jest.fn(),
				deleteUser: jest.fn(),
				updateUserById: jest.fn(),
				signOut: jest.fn(),
			},
		},
	},
});

const mockEnv = () => ({
	supabaseUrl: 'test-url',
	supabasePublishableKey: 'test-key',
});

const user = {
	id: 'u1',
	fullName: 'Alice',
	isOnline: true,
} as User;

describe('UserService', () => {
	let service: UserService;
	let repo: ReturnType<typeof mockRepo>;
	let supabase: ReturnType<typeof mockSupabase>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module = await Test.createTestingModule({
			providers: [
				UserService,
				{ provide: getRepositoryToken(User), useFactory: mockRepo },
				{ provide: SupabaseService, useFactory: mockSupabase },
				{ provide: EnvService, useFactory: mockEnv },
			],
		}).compile();

		service = module.get(UserService);
		repo = module.get(getRepositoryToken(User));
		supabase = module.get(SupabaseService);
	});

	describe('updateUserActivity', () => {
		it('updates activity for online user', async () => {
			repo.findOne.mockResolvedValue(user);
			repo.update.mockResolvedValue(undefined);

			const result = await service.updateUserActivity('u1');

			expect(result.message).toBe('User activity updated successfully');
			expect(repo.update).toHaveBeenCalled();
		});

		it('throws NotFoundException when user not found', async () => {
			repo.findOne.mockResolvedValue(null);

			await expect(service.updateUserActivity('u1')).rejects.toThrow(NotFoundException);
		});

		it('throws ForbiddenException when user is offline', async () => {
			repo.findOne.mockResolvedValue({ ...user, isOnline: false });

			await expect(service.updateUserActivity('u1')).rejects.toThrow(ForbiddenException);
		});
	});

	describe('updateMe', () => {
		it('updates user profile', async () => {
			const qb = repo.createQueryBuilder();
			qb.execute.mockResolvedValue({ raw: [{}] });

			const result = await service.updateMe('u1', { fullName: 'Bob' });

			expect(result.message).toBe('Profile updated successfully');
		});

		it('throws NotFoundException if update fails', async () => {
			const qb = repo.createQueryBuilder();
			qb.execute.mockResolvedValue(null);

			await expect(
				service.updateMe('u1', { fullName: 'Bob' }),
			).rejects.toThrow(NotFoundException);
		});
	});

	describe('deleteAccount', () => {
		it('deletes user successfully', async () => {
			supabase.admin.auth.admin.deleteUser.mockResolvedValue({ error: null });
			repo.delete.mockResolvedValue(undefined);

			const result = await service.deleteAccount('u1');

			expect(result.message).toBe('Account deleted successfully');
			expect(repo.delete).toHaveBeenCalledWith({ id: 'u1' });
		});

		it('throws InternalServerErrorException on supabase failure', async () => {
			supabase.admin.auth.admin.deleteUser.mockResolvedValue({
				error: new Error('fail'),
			});

			await expect(service.deleteAccount('u1')).rejects.toThrow(
				InternalServerErrorException,
			);
		});
	});

	describe('changePassword', () => {
		it('throws NotFoundException if user not found', async () => {
			supabase.admin.auth.admin.getUserById.mockResolvedValue({
				data: { user: null },
			});

			await expect(
				service.changePassword('u1', {
					currentPassword: 'old',
					newPassword: 'new',
				}),
			).rejects.toThrow(NotFoundException);
		});

		it('throws UnauthorizedException on wrong password', async () => {
			supabase.admin.auth.admin.getUserById.mockResolvedValue({
				data: { user: { email: 'test@mail.com' } },
			});

			jest.spyOn(supabaseClient, 'createAnonClient').mockReturnValue({
				auth: {
					signInWithPassword: jest.fn().mockResolvedValue({
						error: new Error('wrong password'),
					}),
					signOut: jest.fn(),
				},
			} as unknown as ReturnType<typeof supabaseClient.createAnonClient>);

			await expect(
				service.changePassword('u1', {
					currentPassword: 'wrong',
					newPassword: 'new',
				}),
			).rejects.toThrow(UnauthorizedException);
		});

		it('changes password successfully', async () => {
			supabase.admin.auth.admin.getUserById.mockResolvedValue({
				data: { user: { email: 'test@mail.com' } },
			});

			jest.spyOn(supabaseClient, 'createAnonClient').mockReturnValue({
				auth: {
					signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
					signOut: jest.fn(),
				},
			} as unknown as ReturnType<typeof supabaseClient.createAnonClient>);

			supabase.admin.auth.admin.updateUserById.mockResolvedValue({
				error: null,
			});

			supabase.admin.auth.admin.signOut.mockResolvedValue({});

			const result = await service.changePassword('u1', {
				currentPassword: 'old',
				newPassword: 'new',
			});

			expect(result.message).toContain('Password changed successfully');
		});
	});
});