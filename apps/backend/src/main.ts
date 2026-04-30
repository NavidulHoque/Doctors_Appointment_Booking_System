import 'reflect-metadata';
import fastifyHelmet from '@fastify/helmet';
import fastifyScalar from '@scalar/fastify-api-reference';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, patchNestJsSwagger } from 'nestjs-zod';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import { AppModule }  from '@backend/app.module';
import { EnvService } from '@backend/modules/config/env.service';
import { buildFastifyAdapter } from '@backend/modules/config/fastify.adapter';

async function bootstrap() {
    patchNestJsSwagger();

    const app = await NestFactory.create<NestFastifyApplication>(AppModule, buildFastifyAdapter());

    app.useGlobalPipes(new ZodValidationPipe());

    // Generate OpenAPI spec (same as before — no change here)
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Doctor Appointment Booking API')
        .setDescription('REST API for the Doctor Appointment Booking System')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    app.enableShutdownHooks();
    await app.init();

    const fastify = app.getHttpAdapter().getInstance() as unknown as FastifyInstance;

    // Serve raw spec at /spec.json
    fastify.get('/spec.json', async (_req, reply) => {
        reply.send(document);
    });

    // Register Scalar UI at /docs  ← this replaces SwaggerModule.setup()
    await fastify.register(fastifyScalar, {
        routePrefix: '/docs',
        configuration: {
            sources: [{ spec: { url: '/spec.json' } }],
            theme: 'default',
            layout: 'modern',
        },
    });

    await fastify.register(fastifyHelmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc:    ["'self'"],
                scriptSrc:     ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
                styleSrc:      ["'self'", 'https:', "'unsafe-inline'"],
                imgSrc:        ["'self'", 'data:'],
                fontSrc:       ["'self'", 'https:', 'data:'],
                objectSrc:     ["'none'"],
                baseUri:       ["'self'"],
                formAction:    ["'self'"],
                frameAncestors:["'self'"],
            },
        },
    });

    // Raw body parser for Stripe webhook signature verification (unchanged)
    fastify.removeContentTypeParser('application/json');
    fastify.addContentTypeParser(
        'application/json',
        { parseAs: 'buffer' },
        (req: FastifyRequest, body: Buffer, done: (err: Error | null, body?: unknown) => void) => {
            (req as FastifyRequest & { rawBody: Buffer }).rawBody = body;
            try   { done(null, JSON.parse(body.toString())); }
            catch (err) { done(err as Error); }
        },
    );

    const envService = app.get(EnvService);
    app.enableCors({ origin: envService.corsOrigin ?? (envService.isDevelopment ? '*' : false) });
    await app.listen(envService.port, '0.0.0.0');
}

bootstrap();