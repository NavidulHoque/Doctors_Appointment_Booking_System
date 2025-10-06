import { applyDecorators } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsOptionalString() {
    return applyDecorators(
        IsOptional(),
        IsString(),
        Transform(({ value }) => value.trim()),
    );
}
