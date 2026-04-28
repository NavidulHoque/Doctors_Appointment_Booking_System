import { z } from 'zod';

export const CreateMessageSchema = z.object({
	receiverId: z.string().uuid(),
	content: z.string().min(1),
});

export const UpdateMessageSchema = z.object({
	content: z.string().min(1),
});

export type TCreateMessage = z.infer<typeof CreateMessageSchema>;
export type TUpdateMessage = z.infer<typeof UpdateMessageSchema>;
