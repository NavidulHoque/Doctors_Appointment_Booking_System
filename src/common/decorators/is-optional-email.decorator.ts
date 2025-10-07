import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsOptionalEmail() {
    return applyDecorators(
        IsOptional(),
        IsEmail({}, { message: 'Invalid email format' }),
        Transform(({ value }) => value.trim()),
    );
}
