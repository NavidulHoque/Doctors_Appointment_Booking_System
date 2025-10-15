import { IsOptionalArrayEnum, IsOptionalBoolean, IsOptionalEnum, IsOptionalString } from 'src/common/decorators';
import { PaginationDto } from 'src/common/dtos';
import { Method, Status } from '@prisma/client';

export class GetAppointmentsDto extends PaginationDto {

  @IsOptionalString({
    stringMessage: 'Search query must be a string',
    minLength: 3,
    minLengthMessage: 'Search query must be at least 3 characters long',
  })
  readonly search?: string;

  @IsOptionalBoolean({ booleanMessage: 'isPaid must be a boolean' })
  readonly isPaid?: boolean;

  @IsOptionalBoolean({ booleanMessage: 'isToday must be a boolean' })
  readonly isToday?: boolean

  @IsOptionalBoolean({ booleanMessage: 'isPast must be a boolean' })
  readonly isPast?: boolean

  @IsOptionalBoolean({ booleanMessage: 'isFuture must be a boolean' })
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
