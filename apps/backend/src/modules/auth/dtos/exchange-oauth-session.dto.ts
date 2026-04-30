import { createZodDto } from 'nestjs-zod';
import { exchangeOAuthSessionSchema } from '@dab/validation';

export class ExchangeOAuthSessionDto extends createZodDto(exchangeOAuthSessionSchema) {}
