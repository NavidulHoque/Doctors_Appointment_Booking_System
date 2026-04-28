import { createZodDto } from 'nestjs-zod';
import { CreatePaymentSchema } from '@dab/validation';

export class CreatePaymentSessionDto extends createZodDto(CreatePaymentSchema) {}
