import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { UserService } from '@backend/modules/user/user.service';

const mockRepo = () => ({
	findOne: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
});

const user = { id: 'u1', fullName: 'Alice', email: 'alice@test.com', isOnline: true } as User;

describe('UserService', () => {
	let service: UserService;
	let repo: ReturnType<typeof mockRepo>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [UserService, { provide: getRepositoryToken(User), useFactory: mockRepo }],
		}).compile();
		service = module.get(UserService);
		repo = module.get(getRepositoryToken(User));
	});

	describe('getUser', () => {
		it('returns user fields and success message', () => {
			const result = service.getUser(user);
			expect(result.message).toBe('User fetched successfully');
			expect(result.data.email).toBe('alice@test.com');
		});
	});

	describe('updateUserActivity', () => {
		it('updates activity for an online user', async () => {
			repo.findOne.mockResolvedValue(user);
			repo.update.mockResolvedValue(undefined);
			const result = await service.updateUserActivity('u1');
			expect(result.message).toBe('User activity updated successfully');
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

	describe('updateUser', () => {
		it('updates and returns updated user', async () => {
			repo.update.mockResolvedValue(undefined);
			repo.findOne.mockResolvedValue({ ...user, fullName: 'Bob' });
			const result = await service.updateUser({ fullName: 'Bob' }, 'u1');
			expect(result.message).toBe('User updated successfully');
			expect(result.data?.fullName).toBe('Bob');
		});
	});

	describe('deleteUser', () => {
		it('deletes user and returns success message', async () => {
			repo.delete.mockResolvedValue(undefined);
			const result = await service.deleteUser(user);
			expect(result.message).toBe('User deleted successfully');
			expect(repo.delete).toHaveBeenCalledWith({ id: 'u1' });
		});
	});
});
