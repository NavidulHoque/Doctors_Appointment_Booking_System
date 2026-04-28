import { createZodDto } from 'nestjs-zod';
import { QueryAppointmentSchema } from '@dab/validation';

export class GetAppointmentsDto extends createZodDto(QueryAppointmentSchema) {}
