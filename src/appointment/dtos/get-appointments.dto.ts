import { IsOptional } from 'class-validator';
import { Transform, } from 'class-transformer';
import { IsOptionalArrayEnum, IsOptionalEnum, IsOptionalString } from 'src/common/decorators'; 
import { PaginationDto } from 'src/common/dtos';
import { Method, Status } from '@prisma/client';

export class GetAppointmentsDto extends PaginationDto {

  @IsOptionalString({ 
    stringMessage: 'Search query must be a string',
    minLength: 3,
    minLengthMessage: 'Search query must be at least 3 characters long',
  })
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

  @IsOptionalArrayEnum({ 
    enumType: Status, 
    message: `Status must be one of: ${Object.values(Status).join(', ').toLowerCase()}`, 
    isUppercase: true,
    maxSize: 5,
    maxSizeMessage: 'You can select up to 5 statuses'
  })
  readonly status?: Status[];

  @IsOptionalEnum({ 
    enumType: Method, 
    message: 'Payment method must be cash or online', 
    isUppercase: true 
  })
  readonly paymentMethod?: Method;
}
