import { applyDecorators } from '@nestjs/common';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { IsOptionalNumberOptions } from '../interfaces';

export function IsOptionalNumber({
    numberMessage,
    min,
    max,
    minMessage,
    maxMessage,
}: IsOptionalNumberOptions) {
    const decorators: PropertyDecorator[] = [
        IsNumber({}, { message: numberMessage }),
        IsOptional(),
    ];

    if (min !== undefined) {
        decorators.unshift(Min(min, { message: minMessage }));
    }

    if (max !== undefined) {
        decorators.unshift(Max(max, { message: maxMessage }));
    }

    return applyDecorators(...decorators);
}
