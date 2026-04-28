import { createZodDto } from 'nestjs-zod';
import { CreateAppointmentSchema } from '@dab/validation';

export class CreateAppointmentDto extends createZodDto(CreateAppointmentSchema) {}
