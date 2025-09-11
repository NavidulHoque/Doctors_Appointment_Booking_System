import { SetMetadata } from '@nestjs/common';
import { Request } from 'express';

export const CACHE_KEY = 'cache:options';

export type CacheKeyFn = (req: Request) => string | undefined;
export type InvalidateFn = (req: Request) => string;

export interface CacheOptions {
  enabled?: boolean;
  ttl?: number;                           
  key?: string | CacheKeyFn;  // dynamic keys for get
  invalidate?: string | InvalidateFn;     // patterns/keys to delete after writes
}

export const Cache = (options: CacheOptions) => SetMetadata(CACHE_KEY, options);
