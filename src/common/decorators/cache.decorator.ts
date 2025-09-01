import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_options';

export interface CacheOptions {
  ttl?: number;       // TTL in seconds
  enabled?: boolean;  // Enable caching
  key?: string;       // Optional custom cache key
}

export const Cache = (options: CacheOptions = { ttl: 60, enabled: true }) =>
  SetMetadata(CACHE_KEY, options);
