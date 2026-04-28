import 'reflect-metadata';
import fastifyHelmet from '@fastify/helmet';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, patchNestJsSwagger } from 'nestjs-zod';
import type { FastifyInstance, FastifyRequest } from 'fastify';

import { AppModule } from '@backend/app.module';
import { EnvService } from '@backend/modules/config/env.service';
import { buildFastifyAdapter } from '@backend/modules/config/fastify.adapter';

async function bootstrap() {
	patchNestJsSwagger();

	const app = await NestFactory.create<NestFastifyApplication>(AppModule, buildFastifyAdapter());

	app.useGlobalPipes(new ZodValidationPipe());

	const swaggerConfig = new DocumentBuilder()
		.setTitle('Doctor Appointment Booking API')
		.setDescription('REST API for the Doctor Appointment Booking System')
		.setVersion('1.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup('docs', app, document, {
		swaggerOptions: { persistAuthorization: true },
	});

	app.enableShutdownHooks();

	// Initialize NestJS — this registers its internal JSON content type parser
	await app.init();

	const fastify = app.getHttpAdapter().getInstance() as unknown as FastifyInstance;

	await fastify.register(fastifyHelmet, {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
				styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
				imgSrc: ["'self'", 'data:'],
				fontSrc: ["'self'", 'https:', 'data:'],
				objectSrc: ["'none'"],
				baseUri: ["'self'"],
				formAction: ["'self'"],
				frameAncestors: ["'self'"],
			},
		},
	});

	// Remove the parser NestJS registered during init, then add ours to capture rawBody for Stripe
	fastify.removeContentTypeParser('application/json');
	fastify.addContentTypeParser(
		'application/json',
		{ parseAs: 'buffer' },
		(req: FastifyRequest, body: Buffer, done: (err: Error | null, body?: unknown) => void) => {
			(req as FastifyRequest & { rawBody: Buffer }).rawBody = body;
			try {
				done(null, JSON.parse(body.toString()));
			} catch (err) {
				done(err as Error);
			}
		},
	);

	const envService = app.get(EnvService);
	app.enableCors({ origin: envService.corsOrigin ?? (envService.isDevelopment ? '*' : false) });
	await app.listen(envService.port, '0.0.0.0');
}

bootstrap();
