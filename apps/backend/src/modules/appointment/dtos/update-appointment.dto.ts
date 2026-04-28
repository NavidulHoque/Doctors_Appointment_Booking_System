import { createZodDto } from 'nestjs-zod';
import { UpdateAppointmentSchema } from '@dab/validation';

export class UpdateAppointmentDto extends createZodDto(UpdateAppointmentSchema) {}
