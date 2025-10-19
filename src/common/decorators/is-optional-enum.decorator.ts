import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { IsOptionalEnumOptions } from '../interfaces';
import { TransformAfterValidation } from './transform-after-validation.decorator';

export function IsOptionalEnum({
    enumType,
    message,
    isLowercase = false,
    isUppercase = false,
}: IsOptionalEnumOptions) {
    return applyDecorators(
        IsEnum(enumType, { message }),
        TransformAfterValidation({ isLowercase, isUppercase }),
        IsOptional()
    );
}
