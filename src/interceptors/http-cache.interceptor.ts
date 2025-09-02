import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map, catchError, throwError, tap, from, switchMap, of } from 'rxjs';
import { randomUUID } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { CACHE_KEY, CacheOptions } from 'src/common/decorators/cache.decorator';
import { Request } from 'express';

@Injectable()
export class Http_CacheInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private redisService: RedisService, private reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request & { traceId?: string }>();
    const method = req.method;
    const url = req.url;
    const traceId = randomUUID();
    req.traceId = traceId;
    const now = Date.now();

    const handler = context.getHandler();
    const cacheOptions: CacheOptions =
      this.reflector.get(CACHE_KEY, handler) || { ttl: 60, enabled: false };

    const resolvedKey =
      (typeof cacheOptions.key === 'function'
        ? cacheOptions.key(req)
        : cacheOptions.key) || `cache:${method}:${url}`;

    const handleResponse = next.handle().pipe(
      map((data) => {
        const response = {
          success: true,
          timestamp: new Date().toISOString(),
          traceId,
          data: this.sanitize(data),
        };

        // Cache only GETs
        if (cacheOptions.enabled && method === 'GET') {
          this.redisService.set(resolvedKey, JSON.stringify(response), cacheOptions.ttl || 60);
        }

        // Invalidate on writes
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const invalidate = cacheOptions.invalidate;
          let pattern: string | undefined;

          if (typeof invalidate === 'function') {
            pattern = invalidate(req);
          } 
          
          else if (typeof invalidate === 'string') {
            pattern = invalidate;
          }

          if (pattern) {
            this.redisService.delByPattern(pattern);
          } 
          
          else if (this.redisService.delByPattern) {
            // fallback (broad) invalidation
            this.redisService.delByPattern('cache:GET:*');
          }
        }
        
        return response;
      }),
      tap({
        next: () =>
          console.log(
            `[✅] ${method} ${url} - ${Date.now() - now}ms | traceId=${traceId}`,
          ),
        error: (err) =>
          console.error(
            `[❌] ${method} ${url} - ${Date.now() - now}ms | Error: ${err.message} | traceId=${traceId}`,
          ),
      }),
      catchError((err) => {
        let statusCode = 500;
        let responseBody: any;

        if ((err as any).getStatus) {
          statusCode = (err as any).getStatus();
          const res = (err as any).getResponse();
          responseBody = typeof res === 'object' ? res : { message: res || err.message, error: err.name };
        } else {
          responseBody = { message: err.message || 'Internal Server Error', error: 'Internal Error' };
        }

        const wrappedError = {
          success: false,
          timestamp: new Date().toISOString(),
          traceId,
          error: { statusCode, ...responseBody },
        };

        return throwError(() => new HttpException(wrappedError, statusCode));
      }),
    );

    if (cacheOptions.enabled && method === 'GET') {
      return from(this.redisService.get(resolvedKey)).pipe(
        switchMap((cached) => (cached ? of(JSON.parse(cached)) : handleResponse)),
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
