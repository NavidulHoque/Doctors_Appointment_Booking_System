import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from '@dab/database';
import { NotificationService } from '@dab/backend/modules/notification/notification.service';
import { RealtimeService } from '@dab/backend/modules/realtime/realtime.service';
import { EmailService } from '@dab/backend/modules/email/email.service';
import { EnvService } from '@dab/backend/modules/config/env.service';

const mockRepo = () => ({
	create: jest.fn(),
	save: jest.fn(),
	findAndCount: jest.fn(),
});

const mockRealtime = () => ({ broadcastNotification: jest.fn().mockResolvedValue(undefined) });
const mockEmail = () => ({ alertAdmin: jest.fn().mockResolvedValue(undefined) });
const mockEnv = () => ({ adminEmail: 'admin@test.com' });

describe('NotificationService', () => {
	let service: NotificationService;
	let repo: ReturnType<typeof mockRepo>;
	let realtime: ReturnType<typeof mockRealtime>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				NotificationService,
				{ provide: getRepositoryToken(Notification), useFactory: mockRepo },
				{ provide: RealtimeService, useFactory: mockRealtime },
				{ provide: EmailService, useFactory: mockEmail },
				{ provide: EnvService, useFactory: mockEnv },
			],
		}).compile();
		service = module.get(NotificationService);
		repo = module.get(getRepositoryToken(Notification));
		realtime = module.get(RealtimeService) as unknown as ReturnType<typeof mockRealtime>;
	});

	describe('createNotification', () => {
		it('saves and returns notification', async () => {
			const notif = { id: 'n1', userId: 'u1', content: 'Hello' } as Notification;
			repo.create.mockReturnValue(notif);
			repo.save.mockResolvedValue(notif);
			const result = await service.createNotification('u1', 'Hello');
			expect(result).toEqual(notif);
		});
	});

	describe('sendNotification', () => {
		it('creates notification and broadcasts it', async () => {
			const notif = { id: 'n1', userId: 'u1', content: 'Hello' } as Notification;
			repo.create.mockReturnValue(notif);
			repo.save.mockResolvedValue(notif);
			await service.sendNotification('u1', 'Hello');
			expect(realtime.broadcastNotification).toHaveBeenCalledWith('u1', 'Hello');
		});
	});

	describe('getAllNotifications', () => {
		it('returns paginated notifications', async () => {
			const notifs = [{ id: 'n1' }] as Notification[];
			repo.findAndCount.mockResolvedValue([notifs, 1]);
			const result = await service.getAllNotifications('u1', { page: 1, limit: 10 });
			expect(result.notifications).toEqual(notifs);
			expect(result.pagination.total).toBe(1);
		});
	});
});
