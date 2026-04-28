import { createZodDto } from 'nestjs-zod';
import { LoginSchema } from '@dab/validation';

export class LoginDto extends createZodDto(LoginSchema) {}
