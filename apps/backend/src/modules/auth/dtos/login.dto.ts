import { createZodDto } from 'nestjs-zod';
import { loginSchema } from '@dab/validation';

export class LoginDto extends createZodDto(loginSchema) {}
