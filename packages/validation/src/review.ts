import { z } from 'zod';

export const CreateReviewSchema = z.object({
	doctorId: z.string().uuid(),
	rating: z.number().int().min(1).max(5),
	comment: z.string().optional(),
});

export type TCreateReview = z.infer<typeof CreateReviewSchema>;
