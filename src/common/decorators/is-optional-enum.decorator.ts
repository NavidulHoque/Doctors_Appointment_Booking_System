import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { IsOptionalEnumOptions } from '../interfaces';
import { TransformString } from './transform-string.decorator';

export function IsOptionalEnum({
    enumType,
    message,
    isLowercase = false,
    isUppercase = false,
}: IsOptionalEnumOptions) {
    return applyDecorators(
        TransformString(isLowercase, isUppercase),
        IsOptional(),
        IsEnum(enumType, { message }),
    );
}
