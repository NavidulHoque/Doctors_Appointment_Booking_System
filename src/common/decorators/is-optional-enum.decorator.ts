import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformStringValue } from '../utils/string-transform.util';

interface IsOptionalEnumOptions {
    enumType: object;
    message: string;
    isLowercase?: boolean;
    isUppercase?: boolean;
}

export function IsOptionalEnum({
    enumType,
    message,
    isLowercase = false,
    isUppercase = false,
}: IsOptionalEnumOptions) {
    return applyDecorators(
        IsOptional(),
        Transform(({ value }) => transformStringValue(value, isLowercase, isUppercase)),
        IsEnum(enumType, { message })
    );
}
