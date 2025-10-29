import { applyDecorators } from "@nestjs/common";
import { createStringDecorators } from "./shared-string.decorator";
import { OptionalStringOptions } from "../types";

export function IsOptionalString(options: OptionalStringOptions) {
  return applyDecorators(...createStringDecorators({ ...options, isOptional: true }));
}