import { appointmentGraphOutputSchema } from '@dab/validation';
import { createZodDto } from 'nestjs-zod';

export class AppointmentGraphResponseDto extends createZodDto(appointmentGraphOutputSchema) {}
