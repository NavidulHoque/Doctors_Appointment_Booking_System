import { applyDecorators } from "@nestjs/common";
import { StringArrayOptions } from "src/common/types";
import { createArrayDecorators } from "./shared-array.decorator";

/**
 * Validates and transforms an array of strings.
 * Automatically trims and optionally converts case.
 */
export function IsStringArray(options: StringArrayOptions) {
    return applyDecorators(...createArrayDecorators('string', options));
}