import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformStringValue } from '../utils/string-transform.util';

interface IsOptionalStringOptions {
    stringMessage: string;
    isLowercase?: boolean;
    isUppercase?: boolean;
    minLength?: number;
    maxLength?: number;
    minLengthMessage?: string;
    maxLengthMessage?: string;
}

export function IsOptionalString({
    stringMessage,
    isLowercase = false,
    isUppercase = false,
    minLength,
    maxLength,
    minLengthMessage,
    maxLengthMessage,
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

    return applyDecorators(...decorators);
}
