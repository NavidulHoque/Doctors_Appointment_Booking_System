import { Test } from '@nestjs/testing';
import { StripeService } from '@dab/backend/modules/payment/stripe.service';
import { EnvService } from '@dab/backend/modules/config/env.service';

const mockEnv = () => ({ stripe: { secretKey: 'sk_test_mock' } });

jest.mock('stripe', () => {
	return jest.fn().mockImplementation(() => ({
		checkout: {
			sessions: {
				create: jest.fn().mockResolvedValue({ id: 'cs_test_1', url: 'https://checkout.stripe.com/cs_test_1' }),
			},
		},
	}));
});

describe('StripeService', () => {
	let service: StripeService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [StripeService, { provide: EnvService, useFactory: mockEnv }],
		}).compile();
		service = module.get(StripeService);
	});

	it('creates a checkout session and returns it', async () => {
		const result = await service.createCheckoutSession({
			appointmentId: 'appt1',
			amount: 100,
			doctorStripeAccountId: 'acct_test',
			successUrl: 'https://app.com/success',
			cancelUrl: 'https://app.com/cancel',
		});
		expect(result.id).toBe('cs_test_1');
		expect(result.url).toBe('https://checkout.stripe.com/cs_test_1');
	});
});
