import { createZodDto } from 'nestjs-zod';
import { CreateMessageSchema } from '@dab/validation';

export class CreateMessageDto extends createZodDto(CreateMessageSchema) {}
