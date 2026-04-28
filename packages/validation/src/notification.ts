import { z } from 'zod';
import { PaginationSchema } from './common';

export const QueryNotificationSchema = PaginationSchema;

export type TQueryNotification = z.infer<typeof QueryNotificationSchema>;
