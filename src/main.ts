import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true
  }))

  // Needed to parse Stripe signature properly
  app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

  await app.listen(Number(process.env.PORT ?? 3000));
}

bootstrap();
