import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map, tap, from, switchMap, of } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { CACHE_KEY, CacheOptions } from 'src/common/decorators/cache.decorator';
import { Request } from 'express';

@Injectable()
export class Http_CacheInterceptor<T> implements NestInterceptor<T, any> {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request & { traceId?: string }>();
    const method = req.method;
    const url = req.url;
    const traceId = req.traceId ?? 'N/A'; // already set in middleware
    const now = Date.now();

    const handler = context.getHandler();
    const cacheOptions: CacheOptions =
      this.reflector.get(CACHE_KEY, handler) || { enabled: false };

    const cachedKey =
      ((cacheOptions.key && typeof cacheOptions.key === 'function')
        ? cacheOptions.key(req)
        : cacheOptions.key) || `cache:${method}:${url}`;

    let logSuffix = '';

    const handleResponse = next.handle().pipe(
      map((data) => {
        const response = {
          success: true,
          timestamp: new Date().toISOString(),
          traceId,
          data,
        };

        // Cache only GETs
        if (cacheOptions.enabled && method === 'GET') {
          this.redisService.set(cachedKey, JSON.stringify(response), cacheOptions.ttl || 60);
        }

        // Invalidate cache on writes
        else if (
          cacheOptions.enabled &&
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        ) {
          logSuffix = '(cache cleared)';
          this.redisService.del(cachedKey);
        }

        return response;
      }),
      tap({
        next: () =>
          console.log(
            `[✅] ${method} ${url} - ${Date.now() - now}ms ${logSuffix} | traceId=${traceId}`,
          ),
        error: (err) =>
          console.error(
            `[❌] ${method} ${url} - ${Date.now() - now}ms | Error: ${err.message} | traceId=${traceId}`,
          ),
      }),
    );

    // Handle GET with cache lookup
    if (cacheOptions.enabled && method === 'GET') {
      return from(this.redisService.get(cachedKey)).pipe(
        switchMap((cached) => {
          if (cached) {
            console.log(
              `[✅] ${method} ${url} - ${Date.now() - now}ms (cache hit) | traceId=${traceId}`,
            );
            return of(JSON.parse(cached));
          }
          return handleResponse;
        }),
      );
    }

    return handleResponse;
  }
}
