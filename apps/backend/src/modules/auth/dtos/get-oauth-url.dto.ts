import { createZodDto } from 'nestjs-zod';
import { getOAuthUrlSchema } from '@dab/validation';

export class GetOAuthUrlDto extends createZodDto(getOAuthUrlSchema) {}
