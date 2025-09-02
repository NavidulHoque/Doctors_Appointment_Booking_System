import { Request } from "express";

export interface RequestWithTrace extends Request {
  traceId: string;
}