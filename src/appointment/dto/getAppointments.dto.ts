import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseAppointmentDto } from './baseAppointment.dto';

export class GetAppointmentsDto extends BaseAppointmentDto {

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  readonly page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(10, { message: 'Limit must be at most 10' })
  readonly limit?: number;

  @IsOptional()
  @IsString()
  readonly search?: string;

  @IsOptional()
  @IsString()
  readonly doctorId?: string;

  @IsOptional()
  @IsString()
  readonly patientId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
  })
  readonly isPaid?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  readonly isToday?: boolean

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  readonly isPast?: boolean

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  readonly isFuture?: boolean
}
