import { CacheKeyFn, InvalidateFn } from "../types";

export interface CacheOptions {
  enabled?: boolean;
  ttl?: number;                           
  key?: string | CacheKeyFn;  
  invalidate?: string | InvalidateFn;  
}