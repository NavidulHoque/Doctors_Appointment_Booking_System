import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto';

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

    @IsOptional()
    @IsString()
    readonly specialization?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.toLowerCase())
    readonly search?: string;
}

