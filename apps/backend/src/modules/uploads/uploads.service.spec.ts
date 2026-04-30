import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@dab/database';
import { UploadsService } from '@dab/backend/modules/uploads/uploads.service';
import { SupabaseService } from '@dab/backend/modules/supabase/supabase.service';

const mockRepo = () => ({ update: jest.fn() });

const mockSupabase = () => ({
	admin: {
		storage: {
			from: jest.fn().mockReturnValue({
				createSignedUploadUrl: jest.fn(),
				getPublicUrl: jest.fn(),
			}),
		},
	},
});

describe('UploadsService', () => {
	let service: UploadsService;
	let supabase: ReturnType<typeof mockSupabase>;
	let repo: ReturnType<typeof mockRepo>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				UploadsService,
				{ provide: getRepositoryToken(User), useFactory: mockRepo },
				{ provide: SupabaseService, useFactory: mockSupabase },
			],
		}).compile();
		service = module.get(UploadsService);
		supabase = module.get(SupabaseService) as unknown as ReturnType<typeof mockSupabase>;
		repo = module.get(getRepositoryToken(User));
	});

	describe('requestAvatarUploadUrl', () => {
		it('throws BadRequestException for invalid file extension', async () => {
			await expect(service.requestAvatarUploadUrl('u1', 'file.pdf', 'application/pdf')).rejects.toThrow(BadRequestException);
		});

		it('returns signed URL for valid image', async () => {
			const bucket = { createSignedUploadUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://signed', path: 'u1/avatar.jpg' }, error: null }) };
			supabase.admin.storage.from.mockReturnValue(bucket);
			const result = await service.requestAvatarUploadUrl('u1', 'photo.jpg', 'image/jpeg');
			expect(result.data.signedUrl).toBe('https://signed');
		});

		it('throws BadRequestException when Supabase returns an error', async () => {
			const bucket = { createSignedUploadUrl: jest.fn().mockResolvedValue({ data: null, error: { message: 'Storage error' } }) };
			supabase.admin.storage.from.mockReturnValue(bucket);
			await expect(service.requestAvatarUploadUrl('u1', 'photo.jpg', 'image/jpeg')).rejects.toThrow(BadRequestException);
		});
	});

	describe('confirmAvatarUpload', () => {
		it('updates avatar URL and returns success', async () => {
			const bucket = { getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://public/avatar.jpg' } }) };
			supabase.admin.storage.from.mockReturnValue(bucket);
			repo.update.mockResolvedValue(undefined);
			const result = await service.confirmAvatarUpload('u1', 'u1/avatar.jpg');
			expect(result.message).toBe('Avatar image updated successfully');
			expect(result.data).toBe('https://public/avatar.jpg');
		});
	});
});
