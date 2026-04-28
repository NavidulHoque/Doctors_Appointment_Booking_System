import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const reply = ctx.getResponse<FastifyReply>();
		const request = ctx.getRequest<FastifyRequest>();

		const traceId = request.id ?? 'unknown';

		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		let responseBody: Record<string, unknown> = { message: 'Internal server error' };

		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			const res = exception.getResponse();
			responseBody = typeof res === 'string' ? { message: res } : (res as Record<string, unknown>);
		} else {
			this.logger.error(`Unhandled error [${traceId}]:`, exception);
		}

		reply.status(statusCode).send({
			success: false,
			timestamp: new Date().toISOString(),
			traceId,
			error: {
				statusCode,
				...responseBody,
			},
		});
	}
}
