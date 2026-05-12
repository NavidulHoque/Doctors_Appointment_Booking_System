import { createZodDto } from 'nestjs-zod';
import { createAppointmentResponseSchema } from '@dab/validation';

export class CreateAppointmentResponseDto extends createZodDto(createAppointmentResponseSchema) {}
