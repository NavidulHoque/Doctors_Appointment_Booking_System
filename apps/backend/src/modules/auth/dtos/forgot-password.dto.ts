import { createZodDto } from 'nestjs-zod';
import { ForgotPasswordSchema } from '@dab/validation';

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
