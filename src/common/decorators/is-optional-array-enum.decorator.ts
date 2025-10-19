import { applyDecorators } from '@nestjs/common';
import { ArrayMaxSize, IsEnum, IsOptional } from 'class-validator';
import { TransformAfterValidation } from './transform-after-validation.decorator';
import { IsOptionalArrayEnumOptions } from '../interfaces';

export function IsOptionalArrayEnum({
    enumType,
    message,
    isLowercase = false,
    isUppercase = false,
    maxSize,
    maxSizeMessage,
}: IsOptionalArrayEnumOptions) {
    const decorators: PropertyDecorator[] = [
        IsEnum(enumType, {
            each: true,
            message,
        }),
        TransformAfterValidation({ isLowercase, isUppercase }),
        IsOptional(),
    ];

    if (maxSize !== undefined) {
        decorators.unshift(ArrayMaxSize(maxSize, { message: maxSizeMessage }));
    }

    return applyDecorators(...decorators);
}
