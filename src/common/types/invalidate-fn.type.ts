import { Request } from "express";

export type InvalidateFn = (req: Request) => string;