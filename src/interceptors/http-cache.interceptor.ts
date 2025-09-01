import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  Observable,
  map,
  catchError,
  throwError,
  tap,
  from,
  switchMap,
  of,
} from 'rxjs';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { CACHE_KEY, CacheOptions } from 'src/common/decorators/cache.decorator';

@Injectable()
export class Http_CacheInterceptor<T> implements NestInterceptor<T, any> {
  constructor(
    private redisService: RedisService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const requestId = randomUUID();
    const now = Date.now();

    const handler = context.getHandler();
    const cacheOptions: CacheOptions =
      this.reflector.get(CACHE_KEY, handler) || {
        ttl: 60,
        enabled: method === 'GET',
      };

    // Determine cache key
    const cacheKey = cacheOptions.key || `cache:${method}:${url}`;

    const handleResponse = next.handle().pipe(
      map((data) => {
        const response = {
          success: true,
          timestamp: new Date().toISOString(),
          requestId,
          data: this.sanitize(data),
        };

        // Cache GET responses
        if (cacheOptions.enabled && method === 'GET') {
          this.redisService.set(
            cacheKey,
            JSON.stringify(response),
            cacheOptions.ttl || 60,
          );
        }

        // Invalidate cache on write operations
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          if (this.redisService.delByPattern) {
            this.redisService.delByPattern('cache:GET:*'); // Clear all GET caches
          }
        }

        return response;
      }),
      tap({
        next: () =>
          console.log(
            `[✅] ${method} ${url} - ${Date.now() - now}ms`,
          ),
        error: (err) =>
          console.error(
            `[❌] ${method} ${url} - ${Date.now() - now}ms | Error: ${err.message}`,
          ),
      }),
      catchError((err) =>
        throwError(() => ({
          success: false,
          timestamp: new Date().toISOString(),
          requestId,
          error: {
            message: err.message || 'Internal Server Error',
            code: err.code || 'INTERNAL_ERROR',
          },
        })),
      ),
    );

    // Check cache only for GET requests
    if (cacheOptions.enabled && method === 'GET') {
      return from(this.redisService.get(cacheKey)).pipe(
        switchMap((cached) =>
          cached ? of(JSON.parse(cached)) : handleResponse,
        ),
      );
    }

    return handleResponse;
  }

  private sanitize(obj: any) {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.removeSensitive(item));
    return this.removeSensitive(obj);
  }

  private removeSensitive(item: any) {
    const { password, refreshToken, ...rest } = item ?? {};
    return rest;
  }
}
