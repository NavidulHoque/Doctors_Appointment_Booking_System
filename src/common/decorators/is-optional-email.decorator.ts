import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsOptional } from 'class-validator';
import { TransformString } from './transform-string.decorator';

export function IsOptionalEmail() {
    return applyDecorators(
        TransformString(),
        IsOptional(),
        IsEmail({}, { message: 'Invalid email format' })
    );
}
