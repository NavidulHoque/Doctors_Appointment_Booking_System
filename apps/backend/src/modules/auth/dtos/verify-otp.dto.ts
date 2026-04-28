import { createZodDto } from 'nestjs-zod';
import { VerifyOtpSchema } from '@dab/validation';

export class VerifyOtpDto extends createZodDto(VerifyOtpSchema) {}
