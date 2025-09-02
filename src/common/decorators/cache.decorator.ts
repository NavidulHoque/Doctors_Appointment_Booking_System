import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_options';

export interface CacheOptions {
  ttl?: number;      
  enabled?: boolean;  
  key?: string;       
}

export const Cache = (options: CacheOptions = { ttl: 60, enabled: true }) =>
  SetMetadata(CACHE_KEY, options);
