import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsOptionalArrayEnum(enumType: object, message: string) {
    return applyDecorators(
        IsOptional(),
        Transform(({ value }) =>
            Array.isArray(value)
                ? value.map((v) => v.trim().toUpperCase())
                : [value.trim().toUpperCase()],
        ),
        IsEnum(enumType, {
            each: true,
            message
        }),
    );
}
