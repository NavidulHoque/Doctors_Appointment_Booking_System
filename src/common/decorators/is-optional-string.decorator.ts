import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsOptionalStringOptions } from '../interfaces';
import { TransformAfterValidation } from './transform-after-validation.decorator';

export function IsOptionalString({
    stringMessage,
    isLowercase = false,
    isUppercase = false,
    minLength,
    maxLength,
    minLengthMessage,
    maxLengthMessage,
    matches
}: IsOptionalStringOptions) {
    const decorators: PropertyDecorator[] = [
        TransformAfterValidation({ isLowercase, isUppercase }),
        IsString({ message: stringMessage }),
        IsOptional(),
    ];

    if (minLength !== undefined) {
        decorators.unshift(MinLength(minLength, { message: minLengthMessage }));
    }

    if (maxLength !== undefined) {
        decorators.unshift(MaxLength(maxLength, { message: maxLengthMessage }));
    }

    if (matches) {
        decorators.unshift(Matches(matches.pattern, { message: matches.message }));
    }

    return applyDecorators(...decorators);
}
