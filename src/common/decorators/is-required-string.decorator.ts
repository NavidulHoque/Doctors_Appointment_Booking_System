import { applyDecorators } from "@nestjs/common";
import { createStringDecorators } from "./shared-string.decorator";
import { RequiredStringOptions, StringOptions } from "../types";

export function IsRequiredString(options: RequiredStringOptions) {
  return applyDecorators(...createStringDecorators({ ...options, isOptional: false }));
}