import { createZodDto } from 'nestjs-zod';
import { UpdateMessageSchema } from '@dab/validation';

export class UpdateMessageDto extends createZodDto(UpdateMessageSchema) {}
