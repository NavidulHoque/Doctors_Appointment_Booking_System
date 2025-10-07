import { applyDecorators } from '@nestjs/common';
import { ArrayMaxSize, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformStringArray } from '../utils/string-transform.util';

interface IsOptionalArrayEnumOptions {
    enumType: object;
    message: string;
    isLowercase?: boolean;
    isUppercase?: boolean;
    maxSize?: number;
    maxSizeMessage?: string;
}

export function IsOptionalArrayEnum({
    enumType,
    message,
    isLowercase = false,
    isUppercase = false,
    maxSize,
    maxSizeMessage,
}: IsOptionalArrayEnumOptions) {
    const decorators: PropertyDecorator[] = [
        IsOptional(),
        Transform(({ value }) => transformStringArray(value, isLowercase, isUppercase)),
        IsEnum(enumType, {
            each: true,
            message,
        }),
    ];

    if (maxSize !== undefined) {
        decorators.push(ArrayMaxSize(maxSize, { message: maxSizeMessage }));
    }

    return applyDecorators(...decorators);
}
