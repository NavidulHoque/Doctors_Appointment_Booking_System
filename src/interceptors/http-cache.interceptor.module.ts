import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { RedisService } from 'src/redis';
import { Http_CacheInterceptor } from './http-cache.interceptor';

@Module({
  providers: [
    RedisService,
    Reflector,
    {
      provide: APP_INTERCEPTOR,
      useClass: Http_CacheInterceptor,
    },
  ],
})
export class HttpResponseModule {}
