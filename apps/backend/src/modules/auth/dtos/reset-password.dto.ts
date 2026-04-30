import { createZodDto } from 'nestjs-zod';
import { resetPasswordSchema } from '@dab/validation';

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
