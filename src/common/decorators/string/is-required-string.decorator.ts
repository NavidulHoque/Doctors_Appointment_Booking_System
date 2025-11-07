import { applyDecorators } from "@nestjs/common";
import { createStringDecorators } from "./shared-string.decorator";
import { RequiredStringOptions } from "src/common/types";

/**
 * Decorator that validates an required string field with various constraints.
 * Supports transformations to lowercase/uppercase, length constraints, pattern matching etc.
 * 
 * @param options - Configuration options for the string validation.
 * @returns A property decorator that applies the specified validations.
 */
export function IsRequiredString(options: RequiredStringOptions) {
  return applyDecorators(...createStringDecorators(options));
}