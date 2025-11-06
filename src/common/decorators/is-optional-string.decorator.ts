import { applyDecorators } from "@nestjs/common";
import { createStringDecorators } from "./shared-string.decorator";
import { OptionalStringOptions } from "../types";

/**
 * Decorator that validates an optional string field with various constraints.
 * Supports transformations to lowercase/uppercase, length constraints, and pattern matching.
 * 
 * @param options - Configuration options for the string validation.
 * @returns A property decorator that applies the specified validations.
 */
export function IsOptionalString(options: OptionalStringOptions) {
  return applyDecorators(...createStringDecorators({ ...options, isOptional: true }));
}