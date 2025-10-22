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
