import { createZodDto } from 'nestjs-zod';
import { changePasswordSchema } from '@dab/validation';

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
