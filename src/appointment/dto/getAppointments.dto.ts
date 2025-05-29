import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseAppointmentDto } from './baseAppointment.dto';

export class GetAppointmentsDto extends BaseAppointmentDto {

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(10, { message: 'Limit must be at most 10' })
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
  })
  isPaid?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isToday?: boolean

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isPast?: boolean

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isFuture?: boolean
}
