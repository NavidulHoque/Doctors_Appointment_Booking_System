import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, Max, Min } from "class-validator";

export class PaginationDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Min(1, { message: 'Page must be at least 1' })
    readonly page: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    @Max(10, { message: 'Limit must be at most 10' })
    readonly limit: number;
}
