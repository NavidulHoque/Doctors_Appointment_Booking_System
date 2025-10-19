import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { IsRequiredNumberOptions } from '../interfaces';

export function IsRequiredNumber({
    requiredMessage,
    numberMessage,
    min,
    max,
    minMessage,
    maxMessage,
}: IsRequiredNumberOptions) {
    const decorators: PropertyDecorator[] = [
        IsNumber({}, { message: numberMessage }),
        IsNotEmpty({ message: requiredMessage }),
    ];

    if (min !== undefined) {
        decorators.unshift(Min(min, { message: minMessage }));
    }

    if (max !== undefined) {
        decorators.unshift(Max(max, { message: maxMessage }));
    }

    return applyDecorators(...decorators);
}
