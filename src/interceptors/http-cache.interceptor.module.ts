import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { Http_CacheInterceptor } from './http-cache.interceptor';

@Module({
  imports: [RedisModule],
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
