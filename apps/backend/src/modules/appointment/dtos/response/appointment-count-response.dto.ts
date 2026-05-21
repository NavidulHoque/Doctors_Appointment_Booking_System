import { appointmentCountOutputSchema } from '@dab/validation';
import { createZodDto } from 'nestjs-zod';

export class AppointmentCountResponseDto extends createZodDto(appointmentCountOutputSchema) {}
