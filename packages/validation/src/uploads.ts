import { z } from 'zod';

export const RequestAvatarUploadSchema = z.object({
	fileName: z.string().min(1),
	mimeType: z.string().min(1),
});

export const ConfirmAvatarUploadSchema = z.object({
	filePath: z.string().min(1),
});

export type TRequestAvatarUpload = z.infer<typeof RequestAvatarUploadSchema>;
export type TConfirmAvatarUpload = z.infer<typeof ConfirmAvatarUploadSchema>;
