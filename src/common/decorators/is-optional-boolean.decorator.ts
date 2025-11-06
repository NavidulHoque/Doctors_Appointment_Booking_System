import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';
import { IsOptionalBooleanOptions } from '../interfaces';

/**
 * Decorator that validates an optional boolean field.
 * It transforms string representations of booleans ('true', 'false', '1', '0') to actual boolean values.
 */
export function IsOptionalBoolean({ booleanMessage }: IsOptionalBooleanOptions) {
    return applyDecorators(
        Transform(({ value }) => {
            if (value === 'true' || value === '1') return true;
            if (value === 'false' || value === '0') return false;
            return value;
        }),
        IsOptional(),
        IsBoolean({ message: booleanMessage })
    );
}
