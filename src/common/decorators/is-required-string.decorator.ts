import { applyDecorators } from "@nestjs/common";
import { createStringDecorators } from "./shared-string.decorator";
import { RequiredStringOptions } from "../types";

export function IsRequiredString(options: RequiredStringOptions) {
  return applyDecorators(...createStringDecorators(options));
}