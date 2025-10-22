import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export function IsOptionalBoolean({ booleanMessage }: { booleanMessage: string }) {
    return applyDecorators(
        Transform(({ value }) => {
            if (value === 'true') return true;
            if (value === 'false') return false;
            return value;
        }),
        IsOptional(),
        IsBoolean({ message: booleanMessage })
    );
}
