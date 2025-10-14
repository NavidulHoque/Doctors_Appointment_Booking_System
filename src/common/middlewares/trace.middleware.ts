import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function traceMiddleware(
  req: Request & { traceId?: string },
  _: Response,
  next: NextFunction,
) {
  req.traceId = randomUUID();
  next();
}
