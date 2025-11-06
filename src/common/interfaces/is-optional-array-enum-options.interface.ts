import { EnumOptions } from "./enum-options.interface";

export interface IsOptionalArrayEnumOptions extends EnumOptions {
    maxSize?: number;
    maxSizeMessage?: string;
    minSize?: number;
    minSizeMessage?: string;
}