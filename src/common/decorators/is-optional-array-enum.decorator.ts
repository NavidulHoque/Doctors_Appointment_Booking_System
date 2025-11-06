import { applyDecorators } from '@nestjs/common';
import { ArrayMaxSize, ArrayMinSize, IsEnum, IsOptional } from 'class-validator';
import { IsOptionalArrayEnumOptions } from '../interfaces';
import { TransformStringArray } from './transform-string-array.decorator'; 

/**
 * Decorator for optional array enums with string transformation support.
 * Automatically lowercases/uppercases array elements if specified.
 * Supports min/max size validation.
 */
export function IsOptionalArrayEnum({
    enumType,
    message,
    isLowercase = false,
    isUppercase = false,
    minSize,
    minSizeMessage,
    maxSize,
    maxSizeMessage,
}: IsOptionalArrayEnumOptions) {
    const decorators: PropertyDecorator[] = [
        TransformStringArray(isLowercase, isUppercase),
        IsOptional(),
        IsEnum(enumType, {
            each: true,
            message,
        })
    ];

    if (minSize !== undefined) {
        decorators.push(ArrayMinSize(minSize, { message: minSizeMessage }));
    }

    if (maxSize !== undefined) {
        decorators.push(ArrayMaxSize(maxSize, { message: maxSizeMessage }));
    }

    return applyDecorators(...decorators);
}
