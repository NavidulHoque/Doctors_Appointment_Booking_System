import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { TransformString } from './transform-string.decorator';

export function IsRequiredEmail() {
    return applyDecorators(
        TransformString(),
        IsNotEmpty({ message: 'Email is required' }),
        IsEmail({}, { message: 'Invalid email format' })
    );
}
