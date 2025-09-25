import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform, } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Method, Status } from '@prisma/client';

export class GetAppointmentsDto extends PaginationDto {

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

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(Status, { message: 'Status must be pending, confirmed, completed, running or cancelled' })
  readonly status?: Status;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(Method, { message: 'Payment method must be cash or online' })
  readonly paymentMethod?: Method;
}
