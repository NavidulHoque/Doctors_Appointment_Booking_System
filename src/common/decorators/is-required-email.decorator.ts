import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { TransformAfterValidation } from './transform-after-validation.decorator';

export function IsRequiredEmail() {
    return applyDecorators(
        TransformAfterValidation({
            isLowercase: false,
            isUppercase: false,
        }),
        IsEmail({}, { message: 'Invalid email format' }),
        IsNotEmpty({ message: 'Email is required' }),
    );
}
