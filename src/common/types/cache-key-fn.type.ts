import { Request } from "express";

export type CacheKeyFn = (req: Request) => string | undefined;