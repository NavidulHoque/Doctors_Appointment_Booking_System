import { ValidationOptions } from "class-validator";

export interface TransformAfterValidationOptions extends ValidationOptions {
    isLowercase: boolean;
    isUppercase: boolean;
}