import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@dab/database';
import { SupabaseService } from '@dab/backend/modules/supabase/supabase.service';

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const AVATAR_BUCKET = 'avatars';

@Injectable()
export class UploadsService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		private readonly supabase: SupabaseService,
	) {}

	async requestAvatarUploadUrl(userId: string, fileName: string, _mimeType: string) {
		const ext = ('.' + fileName.split('.').pop()!).toLowerCase();
		if (!ALLOWED_EXTS.includes(ext)) {
			throw new BadRequestException('Only image files are allowed');
		}

		const filePath = `${userId}/avatar${ext}`;

		const { data, error } = await this.supabase.admin.storage
			.from(AVATAR_BUCKET)
			.createSignedUploadUrl(filePath);

		if (error) throw new BadRequestException(`Failed to create upload URL: ${error.message}`);

		return {
			message: 'Upload URL generated',
			data: { signedUrl: data.signedUrl, filePath: data.path },
		};
	}

	async confirmAvatarUpload(userId: string, filePath: string) {
		const { data } = this.supabase.admin.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

		await this.userRepo.update({ id: userId }, { avatarImage: data.publicUrl });

		return { message: 'Avatar image updated successfully', data: data.publicUrl };
	}
}
