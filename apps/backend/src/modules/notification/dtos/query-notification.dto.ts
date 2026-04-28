import { createZodDto } from 'nestjs-zod';
import { QueryNotificationSchema } from '@dab/validation';

export class GetNotificationsDto extends createZodDto(QueryNotificationSchema) {}
