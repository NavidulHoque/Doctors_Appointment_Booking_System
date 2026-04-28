import { Test } from '@nestjs/testing';
import { EmailService } from '@backend/modules/email/email.service';
import { EnvService } from '@backend/modules/config/env.service';

const mockEnv = () => ({
	smtp: { host: 'smtp.test.com', port: 587, user: 'u', pass: 'p', from: 'noreply@test.com' },
	adminEmail: 'admin@test.com',
});

jest.mock('nodemailer', () => ({
	createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn().mockResolvedValue(undefined) }),
}));

describe('EmailService', () => {
	let service: EmailService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [EmailService, { provide: EnvService, useFactory: mockEnv }],
		}).compile();
		service = module.get(EmailService);
	});

	it('sendAppointmentReminder resolves without throwing', async () => {
		await expect(
			service.sendAppointmentReminder('patient@test.com', 'Alice', 'Bob', new Date()),
		).resolves.not.toThrow();
	});

	it('alertAdmin resolves without throwing', async () => {
		await expect(service.alertAdmin('Test alert', 'Something happened')).resolves.not.toThrow();
	});
});
