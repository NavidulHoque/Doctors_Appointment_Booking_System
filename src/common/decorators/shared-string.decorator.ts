import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { TransformString } from "./transform-string.decorator";
import { StringOptions } from "../types";

/**
 * Creates string validation decorators based on the provided options.
 * @param requiredMessage - Error message for required field validation.
 * @param stringMessage - Error message for string type validation.
 * @param isEmail - Whether to validate as an email.
 * @param isLowercase - Whether to transform the string to lowercase.
 * @param isUppercase - Whether to transform the string to uppercase.
 * @param isUUID - Whether to validate as a UUID.
 * @param minLength - Minimum length for the string.
 * @param maxLength - Maximum length for the string.
 * @param minLengthMessage - Error message for minimum length validation.
 * @param maxLengthMessage - Error message for maximum length validation.
 * @param matches - Pattern and message for regex matching validation.
 * @param isOptional - Whether the field is optional.
 * @returns An array of property decorators for string validation.
 */
export function createStringDecorators({
    requiredMessage,
    stringMessage,
    isEmail = false,
    isLowercase = false,
    isUppercase = false,
    isUUID = false,
    minLength,
    maxLength,
    minLengthMessage,
    maxLengthMessage,
    matches,
    isOptional
}: StringOptions) {
    const decorators: PropertyDecorator[] = [
        TransformString(isLowercase, isUppercase),
        isOptional ? IsOptional() : IsNotEmpty({ message: requiredMessage }),
    ];

    if (isEmail) {
        decorators.push(IsEmail({}, { message: 'Invalid email format' }));
    } else {
        decorators.push(IsString({ message: stringMessage }));
    }

    if (isUUID) {
        decorators.push(IsUUID('4', { message: 'Invalid UUID format' }));
    }

    if (minLength !== undefined) {
        decorators.push(MinLength(minLength, { message: minLengthMessage }));
    }

    if (maxLength !== undefined) {
        decorators.push(MaxLength(maxLength, { message: maxLengthMessage }));
    }

    if (matches) {
        decorators.push(Matches(matches.pattern, { message: matches.message }));
    }

    return decorators;
}
