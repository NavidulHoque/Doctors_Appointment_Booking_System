import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { RedisService } from './redis/redis.service';
import { Http_CacheInterceptor } from './interceptors/http-cache.interceptor';
import { traceMiddleware } from './common/middlewares';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  /**
   * 🔹 1. Middlewares (run before guards & interceptors)
   */
  app.use(cookieParser());
  app.use(traceMiddleware);

  /**
   * 🔹 2. Special route-specific middleware
   * Stripe webhook raw body parsing (must come before body parser / ValidationPipe)
   */
  app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

  /**
   * 🔹 3. Global filters, interceptors, pipes
   */
  app.useGlobalFilters(new GlobalExceptionFilter());

  const redisService = app.get(RedisService);
  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new Http_CacheInterceptor(redisService, reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true
    }),
  );

  /**
   * 🔹 4. Microservices (Kafka, Redis, etc.)
   */
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'nestjs-kafka-client',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId:
          'nestjs-consumer-group-' + Math.random().toString(36).slice(2),
      },
    },
  });

  await app
    .startAllMicroservices()
    .then(() => logger.log('Kafka Microservice connected'))
    .catch((err) => {
      logger.error('Kafka connection failed', err);
    });

  /**
   * 🔹 5. Security & CORS
   */
  app.enableCors({
    origin: [
      'https://test-frontend.vercel.app', 
      'http://localhost:3000' 
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-TOKEN'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  /**
   * 🔹 6. Start HTTP server
   */
  await app.listen(Number(process.env.PORT ?? 3000));
  logger.log(`HTTP server running on port ${process.env.PORT ?? 3000}`);
}

bootstrap();
