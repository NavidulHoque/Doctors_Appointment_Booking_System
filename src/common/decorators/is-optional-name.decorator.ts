import { applyDecorators } from '@nestjs/common';
import { MinLength, Matches, IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsOptionalName() {
    return applyDecorators(
        IsOptional(),
        IsString({ message: 'Name must be a string' }),
        MinLength(5, { message: 'Name must be at least 5 characters long' }),
        Matches(/^[a-zA-Z. ]+$/, {
            message: 'Name can only contain letters, spaces, and dots',
        }),
        Transform(({ value }) => value.trim())
    );
}
