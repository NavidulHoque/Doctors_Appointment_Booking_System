import { createZodDto } from 'nestjs-zod';
import { CreateDoctorSchema } from '@dab/validation';

export class CreateDoctorDto extends createZodDto(CreateDoctorSchema) {}
