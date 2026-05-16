import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { UserService } from '@dab/backend/modules/user/user.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EnvService } from '@dab/backend/modules/config/env.service';
import * as supabaseClient from '@dab/supabase';

// -------------------------
// ONLY mock what we need
// -------------------------

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

	// -------------------------
	// updateUserActivity
	// -------------------------
	describe('updateUserActivity', () => {
		it('updates activity', async () => {
			repo.findOne.mockResolvedValue(user);
			repo.update.mockResolvedValue({ affected: 1 });

			const res = await service.updateUserActivity('u1');

			expect(res.message).toBe('User activity updated successfully');
		});
	});

	// -------------------------
	// changePassword (FIXED PART)
	// -------------------------
	describe('changePassword', () => {
		it('throws UnauthorizedException on wrong password', async () => {
			supabase.admin.auth.admin.getUserById.mockResolvedValue({
				data: { user: { email: 'test@mail.com' } },
			});

			const signInMock = jest.fn().mockResolvedValue({
				error: new Error('wrong'),
			});

			const signOutMock = jest.fn();

			// ✅ FIX: DO NOT try to fake full SupabaseClient
			jest.spyOn(supabaseClient, 'createAnonClient').mockReturnValue(
				{
					auth: {
						signInWithPassword: signInMock,
						signOut: signOutMock,
					},
				} as unknown as ReturnType<typeof supabaseClient.createAnonClient>
			);

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

			const signInMock = jest.fn().mockResolvedValue({
				error: null,
			});

			const signOutMock = jest.fn();

			jest.spyOn(supabaseClient, 'createAnonClient').mockReturnValue(
				{
					auth: {
						signInWithPassword: signInMock,
						signOut: signOutMock,
					},
				} as unknown as ReturnType<typeof supabaseClient.createAnonClient>
			);

			supabase.admin.auth.admin.updateUserById.mockResolvedValue({
				error: null,
			});

			supabase.admin.auth.admin.signOut.mockResolvedValue({});

			const res = await service.changePassword('u1', {
				currentPassword: 'old',
				newPassword: 'new',
			});

			expect(res.message).toContain('Password changed successfully');
		});
	});
});