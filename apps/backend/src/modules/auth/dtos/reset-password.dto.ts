import { createZodDto } from 'nestjs-zod';
import { ResetPasswordSchema } from '@dab/validation';

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
