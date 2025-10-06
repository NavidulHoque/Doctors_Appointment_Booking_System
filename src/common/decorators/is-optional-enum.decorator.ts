import { applyDecorators } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsOptionalEnum(enumType: object, message: string) {
    return applyDecorators(
        IsOptional(),
        Transform(({ value }) => value.trim().toUpperCase()),
        IsEnum(enumType, { message })
    );
}
