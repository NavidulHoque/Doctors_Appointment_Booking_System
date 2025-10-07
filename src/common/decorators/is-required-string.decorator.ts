import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformStringValue } from '../utils/string-transform.util';
import { IsUUID } from 'class-validator';

interface IsRequiredStringOptions {
    requiredMessage: string;
    stringMessage: string;
    isLowercase?: boolean;
    isUppercase?: boolean;
    isUUID?: boolean;
    minLength?: number;
    maxLength?: number;
    minLengthMessage?: string;
    maxLengthMessage?: string;
    matches?: { pattern: RegExp; message: string };
}

export function IsRequiredString({
    requiredMessage,
    stringMessage,
    isLowercase = false,
    isUppercase = false,
    isUUID = false,
    minLength = 0,
    maxLength = 0,
    minLengthMessage,
    maxLengthMessage,
    matches
}: IsRequiredStringOptions) {
    const decorators: PropertyDecorator[] = [
        IsNotEmpty({ message: requiredMessage }),
        IsString({ message: stringMessage }),
        Transform(({ value }) => transformStringValue(value, isLowercase, isUppercase)),
    ];

    if (isUUID) {
        decorators.push(IsUUID('4', { message: 'Invalid UUID format' }));
    }

    if (minLength) {
        decorators.push(MinLength(minLength, { message: minLengthMessage }));
    }

    if (maxLength) {
        decorators.push(MaxLength(maxLength, { message: maxLengthMessage }));
    }

    if (matches) {
        decorators.push(Matches(matches.pattern, { message: matches.message }));
    }

    return applyDecorators(...decorators);
}
