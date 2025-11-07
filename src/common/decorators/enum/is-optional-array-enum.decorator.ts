import { applyDecorators } from '@nestjs/common';
import { ArrayMaxSize, ArrayMinSize, IsEnum, IsOptional } from 'class-validator';
import { IsOptionalArrayEnumOptions } from 'src/common/interfaces';
import { TransformStringArray } from '../array';

/**
 * Decorator for optional array enums with string transformation support.
 * Automatically lowercases/uppercases array elements if specified.
 * Supports min/max size validation.
 * @param enumType - The enum to validate against.
 * @param message - Custom validation message if the value is invalid.
 * @param isLowercase - Transform string to lowercase before validation (default: false).
 * @param isUppercase - Transform string to uppercase before validation (default: false).
 * @param minSize - Minimum size of the array.
 * @param minSizeMessage - Custom validation message for minimum size.
 * @param maxSize - Maximum size of the array.
 * @param maxSizeMessage - Custom validation message for maximum size.
 * @returns A property decorator that applies the specified validations.
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
