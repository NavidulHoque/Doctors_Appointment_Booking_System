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
