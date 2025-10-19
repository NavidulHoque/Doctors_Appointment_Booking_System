import { ValidationOptions } from "class-validator";

export interface TransformInOrderOptions extends ValidationOptions {
    isLowercase?: boolean;
    isUppercase?: boolean;
}