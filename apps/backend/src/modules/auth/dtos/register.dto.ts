import { createZodDto } from 'nestjs-zod';
import { RegisterSchema } from '@dab/validation';

export class RegisterDto extends createZodDto(RegisterSchema) {}
