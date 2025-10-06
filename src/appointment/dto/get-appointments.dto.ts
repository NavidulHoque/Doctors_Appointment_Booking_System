import { IsEnum, IsOptional, MinLength } from 'class-validator';
import { Transform, } from 'class-transformer';
import { PaginationDto } from 'src/common/dto'; 
import { Method, Status } from '@prisma/client';
import { IsOptionalArrayEnum, IsOptionalEnum, IsOptionalString } from 'src/common/decorators';

export class GetAppointmentsDto extends PaginationDto {

  @IsOptionalString()
  @MinLength(3, { message: 'Search query must be at least 3 characters long' })
  readonly search?: string;

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

  @IsOptionalArrayEnum(Status, 'Status must be one of: pending, confirmed, completed, running, or cancelled')
  readonly status?: Status[];

  @IsOptionalEnum(Method, 'Payment method must be cash or online')
  readonly paymentMethod?: Method;
}
