import { createZodDto } from 'nestjs-zod';
import { updateUserSchema } from '@dab/validation';

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
