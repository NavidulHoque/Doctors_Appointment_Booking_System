import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsUUID } from 'class-validator';
import { IsRequiredStringOptions } from '../interfaces';
import { TransformInOrder } from './transform-in-order.decorator';

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
        TransformInOrder({ isLowercase, isUppercase }),
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
