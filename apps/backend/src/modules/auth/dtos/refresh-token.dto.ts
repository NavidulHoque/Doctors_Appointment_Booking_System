import { createZodDto } from 'nestjs-zod';
import { refreshTokenSchema } from '@dab/validation';

export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
