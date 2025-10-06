import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsRequiredString(message: string) {
    return applyDecorators(
        IsNotEmpty({ message }),
        IsString(),
        Transform(({ value }) => value.trim()),
    );
}
