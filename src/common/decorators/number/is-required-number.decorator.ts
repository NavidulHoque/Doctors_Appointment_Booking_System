import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { IsRequiredNumberOptions } from 'src/common/interfaces';

/**
 * Decorator that validates a required number field with optional min/max constraints.
 * @param requiredMessage - Error message when the field is missing.
 * @param numberMessage - Error message when the field is not a number.
 * @param min - Optional minimum value constraint.
 * @param max - Optional maximum value constraint.
 * @param minMessage - Error message when the value is below the minimum.
 * @param maxMessage - Error message when the value is above the maximum.
 * @returns A property decorator that applies the specified validations.
 */
export function IsRequiredNumber({
    requiredMessage,
    numberMessage,
    min,
    max,
    minMessage,
    maxMessage,
}: IsRequiredNumberOptions) {
    const decorators: PropertyDecorator[] = [
        IsNotEmpty({ message: requiredMessage }),
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
