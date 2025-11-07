import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsOptionalBoolean } from 'src/common/decorators/boolean';
import { PaginationDto } from 'src/common/dtos';
import { IsOptionalSpecialization } from '../decorators';
import { IsOptionalSearch } from 'src/common/decorators/string';

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

    @IsOptionalSpecialization()
    readonly specialization?: string;

    @IsOptionalSearch()
    readonly search?: string;
}

