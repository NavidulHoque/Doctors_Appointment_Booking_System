import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetDoctorsDto {
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Page must be at least 1' })
    page: number;

    @Type(() => Number)
    @IsInt()
    @Max(10, { message: 'Limit must be at most 10' })
    limit: number;

    @IsOptional()
    @IsString()
    specialization?: string;

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? [value].map(Number) : value.map(Number))
    experience?: number[];

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? [value].map(Number) : value.map(Number))
    fees?: number[];

    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? [value] : value)
    weeks?: string[];

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
    })
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.toLowerCase())
    search?: string;
}
