import { applyDecorators } from '@nestjs/common';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { IsOptionalNumberOptions } from 'src/common/interfaces';

/**
 * Decorator that validates an optional number with specified constraints.
 * @param numberMessage - Custom error message for invalid number type.
 * @param min - Minimum value for the number.
 * @param max - Maximum value for the number.
 * @param minMessage - Custom error message for values below the minimum.
 * @param maxMessage - Custom error message for values above the maximum.
 * @returns A property decorator that applies the specified validations.
 */
export function IsOptionalNumber({
    numberMessage,
    min,
    max,
    minMessage,
    maxMessage,
}: IsOptionalNumberOptions) {
    const decorators: PropertyDecorator[] = [
        IsOptional(),
        IsNumber({}, { message: numberMessage }),
    ];

    if (min !== undefined) {
        decorators.push(Min(min, { message: minMessage }));
    }

    if (max !== undefined) {
        decorators.push(Max(max, { message: maxMessage }));
    }

    return applyDecorators(...decorators);
}
