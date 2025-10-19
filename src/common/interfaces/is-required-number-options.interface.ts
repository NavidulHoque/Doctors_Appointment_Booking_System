import { NumberOptions } from "./number-options.interface";

export interface IsRequiredNumberOptions extends NumberOptions {
    requiredMessage: string;
}