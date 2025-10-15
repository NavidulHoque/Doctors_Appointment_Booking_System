import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformStringValue } from '../utils/string-transform.util';
import { StringOptions } from '../interfaces';

interface IsOptionalStringOptions extends StringOptions { }

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
        IsOptional(),
        IsString({ message: stringMessage }),
        Transform(({ value }) => transformStringValue(value, isLowercase, isUppercase)),
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
