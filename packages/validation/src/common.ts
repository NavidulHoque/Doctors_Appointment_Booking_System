import { z } from 'zod';

export const PaginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).default(10),
});

export type TPagination = z.infer<typeof PaginationSchema>;
