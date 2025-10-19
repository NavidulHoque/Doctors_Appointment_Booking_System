import { applyDecorators } from '@nestjs/common';
import { IsDate, IsOptional, } from 'class-validator';
import { Type } from 'class-transformer';
import { DateComparison } from './date-comparison.decorator';
import { ComparisonType } from '../types';
import { dateOptions } from '../interfaces';

export function IsDateField({
    dateMessage,
    isOptional = false,
    comparisonType,
    comparisonMessage,
}: dateOptions
) {
    const decorators: PropertyDecorator[] = [
        IsDate({ message: dateMessage }),
        Type(() => Date),
    ]

    if (isOptional) {
        decorators.push(IsOptional());
    }

    if (comparisonType) {
        decorators.unshift(DateComparison(comparisonType as ComparisonType, { message: comparisonMessage }));
    }

    return applyDecorators(...decorators);
}
