import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsOptionalStringOptions } from '../interfaces';
import { TransformString } from './transform-string.decorator';

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
        TransformString(isLowercase, isUppercase),
        IsOptional(),
        IsString({ message: stringMessage }),
    ];

    if (minLength !== undefined) {
        decorators.push(MinLength(minLength, { message: minLengthMessage }));
    }

    if (maxLength !== undefined) {
        decorators.push(MaxLength(maxLength, { message: maxLengthMessage }));
    }

    if (matches) {
        decorators.push(Matches(matches.pattern, { message: matches.message }));
    }

    return applyDecorators(...decorators);
}
