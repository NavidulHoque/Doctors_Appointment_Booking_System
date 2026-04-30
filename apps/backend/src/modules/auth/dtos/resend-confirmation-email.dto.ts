import { createZodDto } from 'nestjs-zod';
import { resendConfirmationSchema } from '@dab/validation';

export class ResendConfirmationEmailDto extends createZodDto(resendConfirmationSchema) {}
