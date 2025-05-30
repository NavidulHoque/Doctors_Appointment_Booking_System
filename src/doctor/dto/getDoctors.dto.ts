import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BaseDoctorDto } from './baseDoctor.dto';

export class GetDoctorsDto extends BaseDoctorDto {
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Page must be at least 1' })
    readonly page: number;

    @Type(() => Number)
    @IsInt()
    @Max(10, { message: 'Limit must be at most 10' })
    readonly limit: number;

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
    @Transform(({ value }) => value?.toLowerCase())
    readonly search?: string;
}

