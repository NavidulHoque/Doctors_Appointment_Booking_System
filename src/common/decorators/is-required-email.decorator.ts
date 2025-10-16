import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsRequiredEmail() {
    return applyDecorators(
        IsNotEmpty({ message: 'Email is required' }),
        IsEmail({}, { message: 'Invalid email format' }),
        Transform(({ value }) => value.trim()),
    );
}
