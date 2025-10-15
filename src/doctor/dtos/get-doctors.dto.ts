import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsOptionalBoolean, IsOptionalString } from 'src/common/decorators';
import { PaginationDto } from 'src/common/dtos';

export class GetDoctorsDto extends PaginationDto {

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? [value].map(Number) : value.map(Number))
    readonly experience?: number[];

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? [value].map(Number) : value.map(Number))
    readonly fees?: number[];

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? [value] : value)
    readonly weeks?: string[];

    @IsOptionalBoolean({ booleanMessage: 'isActive must be a boolean' })
    readonly isActive?: boolean;

    @IsOptionalString({
        stringMessage: 'Specialization must be a string',
        minLength: 3,
        minLengthMessage: 'Specialization must be at least 3 characters long',
    })
    readonly specialization?: string;

    @IsOptionalString({
        stringMessage: 'search must be a string',
        isLowercase: true
    })
    readonly search?: string;
}

