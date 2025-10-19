import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsEmail } from 'class-validator';
import { TransformInOrder } from './transform-in-order.decorator';

export function IsRequiredEmail() {
    return applyDecorators(
        TransformInOrder(),
        IsEmail({}, { message: 'Invalid email format' }),
        IsNotEmpty({ message: 'Email is required' }),
    );
}
