import { createZodDto } from 'nestjs-zod';
import { forgotPasswordSchema } from '@dab/validation';

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
