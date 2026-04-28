import { createZodDto } from 'nestjs-zod';
import { UpdateUserSchema } from '@dab/validation';

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
