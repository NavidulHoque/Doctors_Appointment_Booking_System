import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Doctor, Review, Appointment } from '@dab/database';
import { DoctorService } from '@backend/modules/doctor/doctor.service';
import { EnvService } from '@backend/modules/config/env.service';
import { RealtimeService } from '@backend/modules/realtime/realtime.service';
import { SupabaseService } from '@backend/modules/supabase/supabase.service';

jest.mock('argon2', () => ({
	hash: jest.fn().mockResolvedValue('hashed'),
	verify: jest.fn().mockResolvedValue(true),
}));

jest.mock('stripe', () =>
	jest.fn().mockImplementation(() => ({
		accounts: {
			create: jest.fn().mockResolvedValue({ id: 'acct_test' }),
			retrieve: jest.fn().mockResolvedValue({ charges_enabled: true, payouts_enabled: true, details_submitted: true }),
		},
		accountLinks: {
			create: jest.fn().mockResolvedValue({ url: 'https://connect.stripe.com/onboard' }),
		},
	})),
);

const mockRepo = () => ({
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	find: jest.fn(),
	count: jest.fn(),
	createQueryBuilder: jest.fn(),
});

const mockEnv = () => ({ stripe: { secretKey: 'sk_test_mock' }, frontendUrl: 'https://app.com' });
const mockRealtime = () => ({ broadcastEvent: jest.fn().mockResolvedValue(undefined) });
const mockSupabase = () => ({
	admin: { auth: { admin: { createUser: jest.fn().mockResolvedValue({ error: null }), updateUserById: jest.fn().mockResolvedValue({ error: null }) } } },
});

const user = { id: 'u1', fullName: 'Dr. Alice', email: 'alice@test.com', role: 'DOCTOR' } as User;
const doctor = { userId: 'u1', specialization: 'Cardiology', education: 'MBBS', experience: 5, aboutMe: '', revenue: 0, fees: 100, stripeAccountId: null, isStripeAccountActive: false, isActive: false, availableTimes: [], createdAt: new Date(), updatedAt: new Date() } as unknown as Doctor;

describe('DoctorService', () => {
	let service: DoctorService;
	let userRepo: ReturnType<typeof mockRepo>;
	let doctorRepo: ReturnType<typeof mockRepo>;
	let _reviewRepo: ReturnType<typeof mockRepo>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				DoctorService,
				{ provide: getRepositoryToken(User), useFactory: mockRepo },
				{ provide: getRepositoryToken(Doctor), useFactory: mockRepo },
				{ provide: getRepositoryToken(Review), useFactory: mockRepo },
				{ provide: getRepositoryToken(Appointment), useFactory: mockRepo },
				{ provide: EnvService, useFactory: mockEnv },
				{ provide: RealtimeService, useFactory: mockRealtime },
				{ provide: SupabaseService, useFactory: mockSupabase },
			],
		}).compile();
		service = module.get(DoctorService);
		userRepo = module.get(getRepositoryToken(User));
		doctorRepo = module.get(getRepositoryToken(Doctor));
		_reviewRepo = module.get(getRepositoryToken(Review));
	});

	describe('createDoctor', () => {
		it('creates doctor and user successfully', async () => {
			userRepo.create.mockReturnValue(user);
			userRepo.save.mockResolvedValue(user);
			doctorRepo.create.mockReturnValue(doctor);
			doctorRepo.save.mockResolvedValue(doctor);

			const result = await service.createDoctor({
				fullName: 'Dr. Alice', email: 'alice@test.com', password: 'pass',
				specialization: 'Cardiology', education: 'MBBS', experience: 5,
				aboutMe: 'About me', fees: 100, availableTimes: ['Monday 9AM'],
			});
			expect(result.message).toBe('Doctor created successfully');
		});
	});

	describe('getAllDoctors', () => {
		it('throws NotFoundException when no doctors found', async () => {
			const qb = { andWhere: jest.fn().mockReturnThis(), leftJoinAndSelect: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([]) };
			doctorRepo.createQueryBuilder.mockReturnValue(qb);
			await expect(service.getAllDoctors({ page: 1, limit: 10 })).rejects.toThrow(NotFoundException);
		});
	});

	describe('createStripeAccount', () => {
		it('creates Stripe account for doctor without existing account', async () => {
			doctorRepo.findOne.mockResolvedValue({ ...doctor, user });
			doctorRepo.update.mockResolvedValue(undefined);

			const result = await service.createStripeAccount('u1');
			expect(result.url).toBe('https://connect.stripe.com/onboard');
		});

		it('throws NotFoundException when doctor not found', async () => {
			doctorRepo.findOne.mockResolvedValue(null);
			await expect(service.createStripeAccount('u1')).rejects.toThrow(NotFoundException);
		});

		it('throws BadRequestException when Stripe account already exists', async () => {
			doctorRepo.findOne.mockResolvedValue({ ...doctor, stripeAccountId: 'acct_existing' });
			await expect(service.createStripeAccount('u1')).rejects.toThrow(BadRequestException);
		});
	});

	describe('activateStripeAccount', () => {
		it('activates a fully onboarded Stripe account', async () => {
			doctorRepo.findOne.mockResolvedValue({ ...doctor, stripeAccountId: 'acct_test' });
			doctorRepo.update.mockResolvedValue(undefined);

			const result = await service.activateStripeAccount('u1');
			expect(result.message).toBe('Stripe account activated successfully');
		});

		it('throws NotFoundException when no Stripe account found', async () => {
			doctorRepo.findOne.mockResolvedValue(null);
			await expect(service.activateStripeAccount('u1')).rejects.toThrow(NotFoundException);
		});
	});

	describe('deleteDoctor', () => {
		it('deletes doctor and broadcasts event', async () => {
			doctorRepo.findOne.mockResolvedValue(doctor);
			doctorRepo.delete.mockResolvedValue(undefined);
			const result = await service.deleteDoctor('u1', 'admin1');
			expect(result.message).toBe('Doctor deleted successfully');
		});

		it('throws NotFoundException when doctor not found', async () => {
			doctorRepo.findOne.mockResolvedValue(null);
			await expect(service.deleteDoctor('u1', 'admin1')).rejects.toThrow(NotFoundException);
		});
	});
});
