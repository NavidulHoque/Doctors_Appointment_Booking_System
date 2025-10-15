import { applyDecorators } from '@nestjs/common';
import { IsNumber, IsOptional, Max, MaxLength, Min, MinLength } from 'class-validator';

interface IsOptionalNumberOptions {
    numberMessage: string;
    min?: number;
    max?: number;
    minMessage?: string;
    maxMessage?: string;
}

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
