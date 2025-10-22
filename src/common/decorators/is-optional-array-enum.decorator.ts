import { applyDecorators } from '@nestjs/common';
import { ArrayMaxSize, IsEnum, IsOptional } from 'class-validator';
import { IsOptionalArrayEnumOptions } from '../interfaces';
import { TransformString } from './transform-string.decorator';

export function IsOptionalArrayEnum({
    enumType,
    message,
    isLowercase = false,
    isUppercase = false,
    maxSize,
    maxSizeMessage,
}: IsOptionalArrayEnumOptions) {
    const decorators: PropertyDecorator[] = [
        TransformString(isLowercase, isUppercase),
        IsOptional(),
        IsEnum(enumType, {
            each: true,
            message,
        })
    ];

    if (maxSize !== undefined) {
        decorators.push(ArrayMaxSize(maxSize, { message: maxSizeMessage }));
    }

    return applyDecorators(...decorators);
}
