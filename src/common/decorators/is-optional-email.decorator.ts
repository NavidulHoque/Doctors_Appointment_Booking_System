import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsOptional } from 'class-validator';
import { TransformAfterValidation } from './transform-after-validation.decorator';

export function IsOptionalEmail() {
    return applyDecorators(
        TransformAfterValidation({
            isLowercase: false,
            isUppercase: false,
        }),
        IsEmail({}, { message: 'Invalid email format' }),
        IsOptional(),
    );
}
