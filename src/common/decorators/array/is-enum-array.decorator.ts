import { applyDecorators } from "@nestjs/common";
import { EnumArrayOptions } from "src/common/types";
import { createArrayDecorators } from "./shared-array.decorator";

/**
 * Validates and transforms an array of enums.
 * Automatically trims and optionally converts case.
 */
export function IsEnumArray(options: EnumArrayOptions) {
    return applyDecorators(...createArrayDecorators('enum', options));
}