import { createZodDto } from 'nestjs-zod';
import { CreateReviewSchema } from '@dab/validation';

export class CreateReviewDto extends createZodDto(CreateReviewSchema) {}
