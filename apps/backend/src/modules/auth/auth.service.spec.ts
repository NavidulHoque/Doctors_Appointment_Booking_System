import { BadRequestException, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Session } from '@dab/database';
import { AuthService } from '@backend/modules/auth/auth.service';
import { SupabaseService } from '@backend/modules/supabase/supabase.service';

jest.mock('argon2', () => ({
	hash: jest.fn().mockResolvedValue('hashed'),
	verify: jest.fn().mockResolvedValue(true),
}));

const mockUserRepo = () => ({
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
});

const mockSessionRepo = () => ({
	create: jest.fn(),
	save: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
});

const mockSupabase = () => ({
	admin: {
		auth: {
			admin: {
				createUser: jest.fn().mockResolvedValue({ error: null }),
				updateUserById: jest.fn().mockResolvedValue({ error: null }),
			},
		},
	},
	anon: {
		auth: {
			signInWithPassword: jest.fn(),
			resetPasswordForEmail: jest.fn(),
			verifyOtp: jest.fn(),
			refreshSession: jest.fn(),
		},
	},
});

const baseUser = { id: 'u1', email: 'alice@test.com', fullName: 'Alice', role: 'PATIENT', password: 'hashed', isOtpVerified: false } as User;

describe('AuthService', () => {
	let service: AuthService;
	let userRepo: ReturnType<typeof mockUserRepo>;
	let sessionRepo: ReturnType<typeof mockSessionRepo>;
	let supabase: ReturnType<typeof mockSupabase>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: getRepositoryToken(User), useFactory: mockUserRepo },
				{ provide: getRepositoryToken(Session), useFactory: mockSessionRepo },
				{ provide: SupabaseService, useFactory: mockSupabase },
			],
		}).compile();
		service = module.get(AuthService);
		userRepo = module.get(getRepositoryToken(User));
		sessionRepo = module.get(getRepositoryToken(Session));
		supabase = module.get(SupabaseService) as unknown as ReturnType<typeof mockSupabase>;
	});

	describe('register', () => {
		it('registers a new user successfully', async () => {
			userRepo.findOne.mockResolvedValue(null);
			userRepo.create.mockReturnValue(baseUser);
			userRepo.save.mockResolvedValue(baseUser);

			const result = await service.register({ fullName: 'Alice', email: 'alice@test.com', password: 'pass' });
			expect(result.message).toContain('Registration successful');
		});

		it('throws ConflictException for duplicate email', async () => {
			userRepo.findOne.mockResolvedValue(baseUser);
			await expect(service.register({ fullName: 'Alice', email: 'alice@test.com', password: 'pass' })).rejects.toThrow(ConflictException);
		});

		it('rolls back DB user if Supabase auth fails', async () => {
			userRepo.findOne.mockResolvedValue(null);
			userRepo.create.mockReturnValue(baseUser);
			userRepo.save.mockResolvedValue(baseUser);
			supabase.admin.auth.admin.createUser.mockResolvedValue({ error: { message: 'Auth error' } });

			await expect(service.register({ fullName: 'Alice', email: 'alice@test.com', password: 'pass' })).rejects.toThrow(BadRequestException);
			expect(userRepo.delete).toHaveBeenCalledWith({ id: 'u1' });
		});
	});

	describe('login', () => {
		const session = { access_token: 'at', refresh_token: 'rt', expires_at: Math.floor(Date.now() / 1000) + 3600 };

		it('logs in successfully with correct role', async () => {
			supabase.anon.auth.signInWithPassword.mockResolvedValue({ data: { user: baseUser, session }, error: null });
			userRepo.findOne.mockResolvedValue(baseUser);
			sessionRepo.create.mockReturnValue({});
			sessionRepo.save.mockResolvedValue({});
			userRepo.update.mockResolvedValue(undefined);

			const result = await service.patientLogin({ email: 'alice@test.com', password: 'pass' });
			expect(result.data.accessToken).toBe('at');
		});

		it('throws UnauthorizedException on Supabase auth failure', async () => {
			supabase.anon.auth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Invalid' } });
			await expect(service.patientLogin({ email: 'x@x.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
		});

		it('throws ForbiddenException when role does not match login endpoint', async () => {
			supabase.anon.auth.signInWithPassword.mockResolvedValue({ data: { user: baseUser, session }, error: null });
			userRepo.findOne.mockResolvedValue({ ...baseUser, role: 'DOCTOR' });
			await expect(service.patientLogin({ email: 'alice@test.com', password: 'pass' })).rejects.toThrow(ForbiddenException);
		});
	});

	describe('forgotPassword', () => {
		it('sends reset email and returns success', async () => {
			userRepo.findOne.mockResolvedValue(baseUser);
			supabase.anon.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
			const result = await service.forgotPassword('alice@test.com');
			expect(result.message).toContain('Password reset email sent');
		});

		it('throws NotFoundException when user not found', async () => {
			userRepo.findOne.mockResolvedValue(null);
			await expect(service.forgotPassword('x@x.com')).rejects.toThrow(NotFoundException);
		});
	});

	describe('verifyOtp', () => {
		it('verifies OTP and marks user as verified', async () => {
			supabase.anon.auth.verifyOtp.mockResolvedValue({ error: null });
			userRepo.update.mockResolvedValue(undefined);
			const result = await service.verifyOtp('alice@test.com', '123456');
			expect(result.message).toBe('OTP verified successfully');
		});

		it('throws BadRequestException on OTP failure', async () => {
			supabase.anon.auth.verifyOtp.mockResolvedValue({ error: { message: 'Invalid OTP' } });
			await expect(service.verifyOtp('alice@test.com', 'wrong')).rejects.toThrow(BadRequestException);
		});
	});

	describe('resetPassword', () => {
		it('resets password for OTP-verified user', async () => {
			userRepo.findOne.mockResolvedValue({ ...baseUser, isOtpVerified: true });
			supabase.admin.auth.admin.updateUserById.mockResolvedValue({ error: null });
			userRepo.update.mockResolvedValue(undefined);
			const result = await service.resetPassword({ email: 'alice@test.com', newPassword: 'newpass' });
			expect(result.message).toBe('Password reset successfully');
		});

		it('throws ForbiddenException when OTP not verified', async () => {
			userRepo.findOne.mockResolvedValue(null);
			await expect(service.resetPassword({ email: 'alice@test.com', newPassword: 'newpass' })).rejects.toThrow(ForbiddenException);
		});
	});

	describe('logout', () => {
		it('deletes session and sets user offline', async () => {
			sessionRepo.delete.mockResolvedValue(undefined);
			userRepo.update.mockResolvedValue(undefined);
			const result = await service.logout('u1', 'rt');
			expect(result.message).toBe('Logged out successfully');
		});
	});
});
