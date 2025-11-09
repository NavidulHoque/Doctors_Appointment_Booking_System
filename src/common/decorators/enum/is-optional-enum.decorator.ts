import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { IsOptionalEnumOptions } from 'src/common/interfaces';
import { TransformString } from '../string';

/**
 * Validates that a property is an optional enum value.
 * Automatically transforms the string to lowercase or uppercase if specified.
 * 
 * @param enumType - The enum to validate against.
 * @param message - Custom validation message if the value is invalid.
 * @param isLowercase - Transform string to lowercase before validation (default: false).
 * @param isUppercase - Transform string to uppercase before validation (default: false).
 * @returns A property decorator that applies the specified validations.
 */
export function IsOptionalEnum({
    enumType,
    enumMessage,
    isLowercase = false,
    isUppercase = false,
}: IsOptionalEnumOptions
) {
    return applyDecorators(
        TransformString(isLowercase, isUppercase),
        IsOptional(),
        IsEnum(enumType, { message: enumMessage }),
    );
}
