import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map, tap, from, switchMap, of } from 'rxjs';
import { RedisService } from 'src/redis'; 
import { CACHE_KEY, CacheOptions } from 'src/common/decorators';
import { Request } from 'express';

@Injectable()
export class Http_CacheInterceptor<T> implements NestInterceptor<T, any> {
  private readonly logger = new Logger(Http_CacheInterceptor.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request & { traceId?: string }>();
    const method = req.method;
    const url = req.url;
    const traceId = req.traceId;
    const now = Date.now();

    const handler = context.getHandler();

    // reading cache decorator metadata
    const cacheOptions: CacheOptions =
      this.reflector.get(CACHE_KEY, handler) || { enabled: false };

    const cachedKey =
      ((cacheOptions.key && typeof cacheOptions.key === 'function')
        ? cacheOptions.key(req)
        : cacheOptions.key);

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
        if (
          cacheOptions.enabled &&
          method === 'GET' &&
          cachedKey
        ) {
          logSuffix = '(DB hit)';
          this.redisService.set(cachedKey, JSON.stringify(response), cacheOptions.ttl || 60);
        }

        // Invalidate cache on writes
        else if (
          cacheOptions.enabled &&
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        ) {

          const pattern = (
            (cacheOptions.invalidate && typeof cacheOptions.invalidate === 'function')
              ? cacheOptions.invalidate(req)
              : cacheOptions.invalidate
          );

          logSuffix = '(cache cleared)';
          this.redisService.delByPattern(pattern!);
        }

        return response;
      }),
      tap({
        next: () =>
          this.logger.log(
            `✅ ${method} ${url} - ${Date.now() - now}ms ${logSuffix} | traceId=${traceId}`,
          ),
        error: (err) =>
          this.logger.error(
            `❌ ${method} ${url} - ${Date.now() - now}ms | Error: ${err.message} | traceId=${traceId}`,
          ),
      }),
    );

    // Handle GET with cache lookup
    if (
      cacheOptions.enabled &&
      method === 'GET' &&
      cachedKey
    ) {
      return from(this.redisService.get(cachedKey)).pipe(
        switchMap((cached) => {
          if (cached) {
            this.logger.log(
              `✅ ${method} ${url} - ${Date.now() - now}ms (cache hit) | traceId=${traceId}`,
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
