import { createZodDto } from 'nestjs-zod';
import { UpdateDoctorSchema } from '@dab/validation';

export class UpdateDoctorDto extends createZodDto(UpdateDoctorSchema) {}
