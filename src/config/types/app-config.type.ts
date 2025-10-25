import { appConfigSchema } from "../app.config";
import { z } from 'zod';

export type AppConfig = z.infer<typeof appConfigSchema>;