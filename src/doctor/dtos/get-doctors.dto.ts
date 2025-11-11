import { IsOptionalBoolean } from 'src/common/decorators/boolean';
import { PaginationDto } from 'src/common/dtos';
import { IsOptionalExperiences, IsOptionalFees, IsOptionalSpecialization, IsOptionalWeekDays } from '../decorators';
import { IsOptionalSearch } from 'src/common/decorators/string';
import { WeekDays } from '../enums';

export class GetDoctorsDto extends PaginationDto {

    @IsOptionalExperiences()
    readonly experience?: number[];

    @IsOptionalFees() 
    readonly fees?: number[];

    @IsOptionalWeekDays()
    readonly weekDays?: WeekDays[];

    @IsOptionalBoolean({ booleanMessage: 'isActive must be a boolean' })
    readonly isActive?: boolean;

    @IsOptionalSpecialization()
    readonly specialization?: string;

    @IsOptionalSearch()
    readonly search?: string;
}

