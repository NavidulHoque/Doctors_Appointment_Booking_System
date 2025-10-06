import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsPassword() {
    return applyDecorators(
        IsNotEmpty({ message: 'Password is required' }),
        IsString(),
        MinLength(8, { message: 'Password must be at least 8 characters long' }),
        Matches(/^(?=.*\d)(?=.*[\W_]).{8,}$/, {
            message:
                'Password must contain at least one number and one special character',
        }),
        Transform(({ value }) => value.trim()),
    );
}
