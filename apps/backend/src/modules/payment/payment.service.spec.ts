import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment, Appointment, Doctor, User } from '@dab/database';
import { PaymentService } from '@dab/backend/modules/payment/payment.service';
import { StripeService } from '@dab/backend/modules/payment/stripe.service';
import { EnvService } from '@dab/backend/modules/config/env.service';

const mockRepo = () => ({ create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() });
const mockStripe = () => ({ createCheckoutSession: jest.fn() });
const mockEnv = () => ({ frontendUrl: 'https://app.com' });

const user = { id: 'u1' } as User;
const appointment = { id: 'appt1', doctorId: 'd1' } as Appointment;
const doctor = { userId: 'd1', fees: 100, isStripeAccountActive: true, stripeAccountId: 'acct_test' } as Doctor;

describe('PaymentService', () => {
	let service: PaymentService;
	let appointmentRepo: ReturnType<typeof mockRepo>;
	let doctorRepo: ReturnType<typeof mockRepo>;
	let paymentRepo: ReturnType<typeof mockRepo>;
	let stripe: ReturnType<typeof mockStripe>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				PaymentService,
				{ provide: getRepositoryToken(Payment), useFactory: mockRepo },
				{ provide: getRepositoryToken(Appointment), useFactory: mockRepo },
				{ provide: getRepositoryToken(Doctor), useFactory: mockRepo },
				{ provide: StripeService, useFactory: mockStripe },
				{ provide: EnvService, useFactory: mockEnv },
			],
		}).compile();
		service = module.get(PaymentService);
		paymentRepo = module.get(getRepositoryToken(Payment));
		appointmentRepo = module.get(getRepositoryToken(Appointment));
		doctorRepo = module.get(getRepositoryToken(Doctor));
		stripe = module.get(StripeService) as unknown as ReturnType<typeof mockStripe>;
	});

	describe('createPaymentSession', () => {
		it('creates a Stripe session and saves a pending payment', async () => {
			appointmentRepo.findOne.mockResolvedValue(appointment);
			doctorRepo.findOne.mockResolvedValue(doctor);
			stripe.createCheckoutSession.mockResolvedValue({ id: 'cs_1', url: 'https://checkout.stripe.com/cs_1' });
			paymentRepo.create.mockReturnValue({});
			paymentRepo.save.mockResolvedValue({});

			const result = await service.createPaymentSession('appt1', user);
			expect(result.url).toBe('https://checkout.stripe.com/cs_1');
			expect(result.message).toBe('Payment session created');
		});

		it('throws NotFoundException when appointment not found', async () => {
			appointmentRepo.findOne.mockResolvedValue(null);
			await expect(service.createPaymentSession('appt1', user)).rejects.toThrow(NotFoundException);
		});

		it('throws NotFoundException when doctor not found', async () => {
			appointmentRepo.findOne.mockResolvedValue(appointment);
			doctorRepo.findOne.mockResolvedValue(null);
			await expect(service.createPaymentSession('appt1', user)).rejects.toThrow(NotFoundException);
		});

		it('throws BadRequestException when doctor Stripe account is inactive', async () => {
			appointmentRepo.findOne.mockResolvedValue(appointment);
			doctorRepo.findOne.mockResolvedValue({ ...doctor, isStripeAccountActive: false });
			await expect(service.createPaymentSession('appt1', user)).rejects.toThrow(BadRequestException);
		});
	});

	describe('getAllPaymentHistory', () => {
		it('returns payments for user', async () => {
			const payments = [{ id: 'p1' }] as Payment[];
			paymentRepo.find.mockResolvedValue(payments);
			const result = await service.getAllPaymentHistory('u1');
			expect(result.payments).toEqual(payments);
		});
	});
});
