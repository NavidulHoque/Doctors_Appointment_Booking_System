import { createZodDto } from 'nestjs-zod';
import { RefreshTokenSchema } from '@dab/validation';

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
