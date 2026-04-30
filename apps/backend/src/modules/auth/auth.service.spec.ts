import { Test, TestingModule } from '@nestjs/testing';
import {
	ConflictException,
	ForbiddenException,
	InternalServerErrorException,
	UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AuthService } from '@dab/backend/modules/auth/auth.service';
import { EnvService } from '@dab/backend/modules/config/env.service';
import { SupabaseService } from '@dab/backend/modules/supabase/supabase.service';
import { User } from '@dab/database';

// ---------------------------------------------------------------------------
// Supabase anon client mock
// ---------------------------------------------------------------------------

const mockSignInWithPassword = jest.fn();
const mockRefreshSession = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockResend = jest.fn();
const mockSetSession = jest.fn();

jest.mock('@dab/supabase', () => ({
	createAnonClient: jest.fn(() => ({
		auth: {
			signInWithPassword: mockSignInWithPassword,
			refreshSession: mockRefreshSession,
			resetPasswordForEmail: mockResetPasswordForEmail,
			resend: mockResend,
			setSession: mockSetSession,
		},
	})),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeSession = (overrides = {}) => ({
	access_token: 'access_token',
	refresh_token: 'refresh_token',
	expires_in: 3600,
	expires_at: 9999999999,
	...overrides,
});

const makeUser = (overrides = {}) => ({
	id: 'u1',
	email: 'alice@test.com',
	email_confirmed_at: '2024-01-01T00:00:00Z',
	user_metadata: {
		fullName: 'Alice',
		full_name: 'Alice',
	},
	...overrides,
});

// ---------------------------------------------------------------------------
// Mock providers (NO TYPES, NO CASTING)
// ---------------------------------------------------------------------------

const mockEnvService = {
	supabaseUrl: 'https://test.supabase.co',
	supabasePublishableKey: 'anon-key',
};

const mockAdminAuth = {
	createUser: jest.fn(),
	deleteUser: jest.fn(),
	updateUserById: jest.fn(),
	signOut: jest.fn(),
};

// IMPORTANT: only include what service uses
const mockSupabaseService = {
	admin: {
		auth: {
			admin: mockAdminAuth,
		},
	},
};

const mockUserRepository = {
	findOne: jest.fn(),
	insert: jest.fn(),
};

const mockQueryBuilder = {
	select: jest.fn().mockReturnThis(),
	from: jest.fn().mockReturnThis(),
	where: jest.fn().mockReturnThis(),
	limit: jest.fn().mockReturnThis(),
	getRawOne: jest.fn(),
};

const mockDataSource = {
	createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: EnvService, useValue: mockEnvService },
				{ provide: SupabaseService, useValue: mockSupabaseService },
				{ provide: getRepositoryToken(User), useValue: mockUserRepository },
				{ provide: DataSource, useValue: mockDataSource },
			],
		}).compile();

		service = module.get(AuthService);
	});

	// -------------------------------------------------------------------------
	// register
	// -------------------------------------------------------------------------

	describe('register', () => {
		const input = {
			fullName: 'Alice',
			email: 'alice@test.com',
			password: 'password123',
		};

		it('should register user successfully', async () => {
			mockAdminAuth.createUser.mockResolvedValue({
				data: { user: { id: 'u1' } },
				error: null,
			});

			mockUserRepository.insert.mockResolvedValue(undefined);
			mockResend.mockResolvedValue({ error: null });

			const result = await service.register(input);

			expect(result.message).toContain('Check your email');
			expect(mockAdminAuth.createUser).toHaveBeenCalled();
			expect(mockUserRepository.insert).toHaveBeenCalledWith({
				id: 'u1',
				fullName: 'Alice',
			});
		});

		it('should throw ConflictException on duplicate email', async () => {
			mockAdminAuth.createUser.mockResolvedValue({
				data: {},
				error: { code: 'email_exists' },
			});

			await expect(service.register(input)).rejects.toThrow(ConflictException);
		});

		it('should rollback user if DB insert fails', async () => {
			mockAdminAuth.createUser.mockResolvedValue({
				data: { user: { id: 'u1' } },
				error: null,
			});

			mockUserRepository.insert.mockRejectedValue(new Error('DB error'));
			mockAdminAuth.deleteUser.mockResolvedValue({ error: null });

			await expect(service.register(input)).rejects.toThrow(
				InternalServerErrorException,
			);

			expect(mockAdminAuth.deleteUser).toHaveBeenCalledWith('u1');
		});
	});

	// -------------------------------------------------------------------------
	// login
	// -------------------------------------------------------------------------

	describe('login', () => {
		const input = {
			email: 'alice@test.com',
			password: 'password123',
		};

		it('should login successfully', async () => {
			const user = makeUser();
			const session = makeSession();

			mockSignInWithPassword.mockResolvedValue({
				data: { session, user },
				error: null,
			});

			mockUserRepository.findOne.mockResolvedValue({
				fullName: 'Alice',
			});

			const result = await service.login(input);

			expect(result.accessToken).toBe(session.access_token);
			expect(result.user.fullName).toBe('Alice');
		});

		it('should throw ForbiddenException if email not confirmed', async () => {
			mockSignInWithPassword.mockResolvedValue({
				data: {},
				error: { code: 'email_not_confirmed' },
			});

			await expect(service.login(input)).rejects.toThrow(ForbiddenException);
		});
	});

	// -------------------------------------------------------------------------
	// logout
	// -------------------------------------------------------------------------

	describe('logout', () => {
		it('should logout successfully', async () => {
			mockAdminAuth.signOut.mockResolvedValue({ error: null });

			const res = await service.logout('token');

			expect(res.message).toBe('Logged out successfully');
		});

		it('should throw on logout failure', async () => {
			mockAdminAuth.signOut.mockResolvedValue({
				error: { message: 'fail' },
			});

			await expect(service.logout('token')).rejects.toThrow(
				InternalServerErrorException,
			);
		});
	});

	// -------------------------------------------------------------------------
	// refresh token
	// -------------------------------------------------------------------------

	describe('refreshToken', () => {
		it('should refresh session', async () => {
			const session = makeSession();
			const user = makeUser();

			mockRefreshSession.mockResolvedValue({
				data: { session, user },
				error: null,
			});

			mockUserRepository.findOne.mockResolvedValue({
				fullName: 'Alice',
			});

			const res = await service.refreshToken({
				refreshToken: 'token',
			});

			expect(res.accessToken).toBe(session.access_token);
		});

		it('should throw on invalid token', async () => {
			mockRefreshSession.mockResolvedValue({
				data: {},
				error: { message: 'invalid' },
			});

			await expect(
				service.refreshToken({ refreshToken: 'bad' }),
			).rejects.toThrow(UnauthorizedException);
		});
	});
});