import { Type } from "class-transformer";
import { IsDefined, IsInt, Max, Min } from "class-validator";

export class PaginationDto {
    @IsDefined({ message: 'Page is required' })
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    readonly page: number;

    @IsDefined({ message: 'Limit is required' })
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Max(10, { message: 'Limit must be at most 10' })
    readonly limit: number;
}
