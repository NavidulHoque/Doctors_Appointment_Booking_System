import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { IsOptionalString } from 'src/common/decorators';
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

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
    })
    readonly isActive?: boolean;

    @IsOptionalString({
        stringMessage: 'Specialization must be a string',
        minLength: 3,
        minLengthMessage: 'Specialization must be at least 3 characters long',
    })
    readonly specialization?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim().toLowerCase())
    readonly search?: string;
}

