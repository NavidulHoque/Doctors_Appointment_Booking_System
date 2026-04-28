import { createZodDto } from 'nestjs-zod';
import { QueryDoctorSchema } from '@dab/validation';

export class GetDoctorsDto extends createZodDto(QueryDoctorSchema) {}
