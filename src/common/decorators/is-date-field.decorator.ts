import { applyDecorators } from '@nestjs/common';
import { IsDate, IsOptional, } from 'class-validator';
import { Type } from 'class-transformer';
import { DateComparison } from './date-comparison.decorator';
import { DateOptions } from '../interfaces';

/**
 * Custom decorator for validating Date fields with optional comparison logic.
 * Combines @IsOptional, @Type(() => Date), @IsDate, and custom @DateComparison.
 * @param dateMessage - Custom error message for invalid date format.
 * @param isOptional - Whether the date field is optional.
 * @param comparisonType - Type of comparison (e.g., 'future', 'past', 'afterField', 'beforeField').
 * @param relatedField - The field to compare against.
 * @param comparisonMessage - Custom error message for comparison validation.
 * @returns A property decorator that applies the specified validations.
 */
export function IsDateField({
    dateMessage,
    isOptional = false,
    comparisonType,
    relatedField,
    comparisonMessage,
}: DateOptions
) {
    const decorators: PropertyDecorator[] = [
        Type(() => Date),
        IsDate({ message: dateMessage }),
    ]

    if (isOptional) {
        decorators.unshift(IsOptional());
    }

    if (comparisonType) {
        decorators.push(
            DateComparison(comparisonType, relatedField, {
                message: comparisonMessage
            }),
        );
    }

    return applyDecorators(...decorators);
}
