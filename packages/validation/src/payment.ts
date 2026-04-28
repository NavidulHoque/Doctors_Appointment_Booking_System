import { z } from 'zod';
import { paymentStatusSchema } from './enums';

export const CreatePaymentSchema = z.object({
	appointmentId: z.string().uuid(),
});

export const QueryPaymentHistorySchema = z.object({
	status: paymentStatusSchema.optional(),
});

export type TCreatePayment = z.infer<typeof CreatePaymentSchema>;
export type TQueryPaymentHistory = z.infer<typeof QueryPaymentHistorySchema>;
