import { createZodDto } from 'nestjs-zod';
import { QueryPaymentHistorySchema } from '@dab/validation';

export class GetPaymentHistoryDto extends createZodDto(QueryPaymentHistorySchema) {}
