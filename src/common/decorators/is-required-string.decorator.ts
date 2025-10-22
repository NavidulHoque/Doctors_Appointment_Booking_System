import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsUUID } from 'class-validator';
import { IsRequiredStringOptions } from '../interfaces';
import { TransformString } from './transform-string.decorator';

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
        TransformString(isLowercase, isUppercase),
        IsNotEmpty({ message: requiredMessage }),
        IsString({ message: stringMessage }),
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
