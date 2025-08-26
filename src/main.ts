import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true
  }))

  // Stripe webhook raw body support
  app.use('/webhook/stripe', express.raw({ type: 'application/json' }));

  // Connect Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'nestjs-kafka-client',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'nestjs-consumer-group-' + Math.random().toString(36).slice(2),
      },
    },
  });

  // Start Kafka consumer
  await app.startAllMicroservices()
    .then(() => console.log('Kafka Microservice connected'))
    .catch(err => {
      console.error('Kafka connection failed', err);
    });

  await app.listen(Number(process.env.PORT ?? 3000));
}

bootstrap();
