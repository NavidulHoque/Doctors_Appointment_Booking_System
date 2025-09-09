import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{ traceId: string }>();

    const traceId = request.traceId;
    const timestamp = new Date();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as any).message  // for raw errors
        
    const wrappedError = {
      success: false,
      timestamp,
      traceId,
      error: { statusCode: status, ...responseBody },
    };

    response.status(status).json(wrappedError);
  }
}
