import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from '@dab/database';
import { MessageService } from '@backend/modules/message/message.service';
import { RealtimeService } from '@backend/modules/realtime/realtime.service';

const mockRepo = () => ({
	create: jest.fn(),
	save: jest.fn(),
	findOne: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	createQueryBuilder: jest.fn(),
});

const mockRealtime = () => ({
	broadcastMessage: jest.fn().mockResolvedValue(undefined),
	broadcastMessageUpdate: jest.fn().mockResolvedValue(undefined),
	broadcastMessageDelete: jest.fn().mockResolvedValue(undefined),
});

const msg = { id: 'm1', senderId: 'u1', receiverId: 'u2', content: 'Hello' } as Message;

describe('MessageService', () => {
	let service: MessageService;
	let repo: ReturnType<typeof mockRepo>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				MessageService,
				{ provide: getRepositoryToken(Message), useFactory: mockRepo },
				{ provide: RealtimeService, useFactory: mockRealtime },
			],
		}).compile();
		service = module.get(MessageService);
		repo = module.get(getRepositoryToken(Message));
	});

	describe('createMessage', () => {
		it('saves message and returns success', async () => {
			repo.create.mockReturnValue(msg);
			repo.save.mockResolvedValue(msg);
			const result = await service.createMessage({ content: 'Hello', receiverId: 'u2' }, 'u1');
			expect(result.message).toBe('Message sent successfully');
			expect(result.data).toEqual(msg);
		});
	});

	describe('getMessages', () => {
		it('returns messages between two users', async () => {
			const qb = { where: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([msg]) };
			repo.createQueryBuilder.mockReturnValue(qb);
			const result = await service.getMessages('u1', 'u2');
			expect(result.data).toEqual([msg]);
		});
	});

	describe('updateMessage', () => {
		it('updates message content', async () => {
			repo.findOne.mockResolvedValue(msg);
			repo.update.mockResolvedValue(undefined);
			const result = await service.updateMessage({ content: 'Updated' }, 'm1', 'u1');
			expect(result.message).toBe('Message updated successfully');
		});

		it('throws NotFoundException when message not found', async () => {
			repo.findOne.mockResolvedValue(null);
			await expect(service.updateMessage({ content: 'x' }, 'm1', 'u1')).rejects.toThrow(NotFoundException);
		});

		it('throws ForbiddenException when editor is not sender', async () => {
			repo.findOne.mockResolvedValue(msg);
			await expect(service.updateMessage({ content: 'x' }, 'm1', 'u99')).rejects.toThrow(ForbiddenException);
		});
	});

	describe('deleteMessage', () => {
		it('deletes message', async () => {
			repo.findOne.mockResolvedValue(msg);
			repo.delete.mockResolvedValue(undefined);
			const result = await service.deleteMessage('m1', 'u1');
			expect(result.message).toBe('Message deleted successfully');
		});

		it('throws NotFoundException when message not found', async () => {
			repo.findOne.mockResolvedValue(null);
			await expect(service.deleteMessage('m1', 'u1')).rejects.toThrow(NotFoundException);
		});

		it('throws ForbiddenException when deleter is not sender', async () => {
			repo.findOne.mockResolvedValue(msg);
			await expect(service.deleteMessage('m1', 'u99')).rejects.toThrow(ForbiddenException);
		});
	});
});
