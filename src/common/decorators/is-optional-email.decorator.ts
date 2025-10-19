import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsOptional } from 'class-validator';
import { TransformInOrder } from './transform-in-order.decorator';

export function IsOptionalEmail() {
    return applyDecorators(
        TransformInOrder(),
        IsEmail({}, { message: 'Invalid email format' }),
        IsOptional(),
    );
}
