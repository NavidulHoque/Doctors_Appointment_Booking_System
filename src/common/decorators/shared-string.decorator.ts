import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { TransformString } from "./transform-string.decorator";
import { StringOptions } from "../types";

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
