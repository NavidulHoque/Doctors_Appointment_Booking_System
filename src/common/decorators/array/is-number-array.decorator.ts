import { applyDecorators } from "@nestjs/common";
import { createArrayDecorators } from "./shared-array.decorator";
import { NumberArrayOptions } from "src/common/types";

/**
 * Validates and transforms an array of numbers.
 */
export function IsNumberArray(options: NumberArrayOptions) {
  return applyDecorators(...createArrayDecorators('number', options));
}