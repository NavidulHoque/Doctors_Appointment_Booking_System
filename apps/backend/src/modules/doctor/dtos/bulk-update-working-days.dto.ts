import { createZodDto } from 'nestjs-zod';
import { BulkUpdateWorkingDaysSchema } from '@dab/validation';

export class BulkUpdateWorkingDaysDto extends createZodDto(
  BulkUpdateWorkingDaysSchema,
) {}