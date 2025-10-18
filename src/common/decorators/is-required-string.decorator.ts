import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformStringValue } from '../utils/string-transform.util';
import { IsUUID } from 'class-validator';
import { TransformAfterValidation } from './transform-after-validation.decorator';

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
        TransformAfterValidation({ isLowercase, isUppercase }),
        IsString({ message: stringMessage }),
        IsNotEmpty({ message: requiredMessage }),
    ];

    if (isUUID) {
        decorators.unshift(IsUUID('4', { message: 'Invalid UUID format' }));
    }

    if (minLength) {
        decorators.unshift(MinLength(minLength, { message: minLengthMessage }));
    }

    if (maxLength) {
        decorators.unshift(MaxLength(maxLength, { message: maxLengthMessage }));
    }

    if (matches) {
        decorators.unshift(Matches(matches.pattern, { message: matches.message }));
    }

    return applyDecorators(...decorators);
}
