import { applyDecorators } from '@nestjs/common';
import { IsDate, IsOptional, } from 'class-validator';
import { Type } from 'class-transformer';
import { DateComparison } from './date-comparison.decorator';
import { ComparisonType } from '../types';

interface dateOptions {
    dateMessage: string;
    isOptional?: boolean;
    comparisonType?: string;
    comparisonMessage?: string;
}

export function IsDateField({
    dateMessage,
    isOptional = false,
    comparisonType,
    comparisonMessage,
}: dateOptions
) {
    const decorators: PropertyDecorator[] = [
        Type(() => Date),
        IsDate({ message: dateMessage }),
    ]

    if (isOptional) {
        decorators.unshift(IsOptional());
    }

    if (comparisonType) {
        decorators.push(DateComparison(comparisonType as ComparisonType, { message: comparisonMessage }));
    }

    return applyDecorators(...decorators);
}
