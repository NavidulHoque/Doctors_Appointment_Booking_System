import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsName() {
    return applyDecorators(
        IsNotEmpty({ message: 'Name is required' }),
        MinLength(5, { message: 'Name must be at least 5 characters long' }),
        Matches(/^[a-zA-Z. ]+$/, {
            message: 'Name can only contain letters, spaces, and dots',
        }),
        Transform(({ value }) => value.trim())
    );
}
