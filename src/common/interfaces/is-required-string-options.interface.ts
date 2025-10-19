import { StringOptions } from "./string-options.interface";

export interface IsRequiredStringOptions extends StringOptions {
    requiredMessage: string;
    isUUID?: boolean;
}