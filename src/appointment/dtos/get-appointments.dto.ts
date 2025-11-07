import { IsOptionalBoolean, IsOptionalSearch } from 'src/common/decorators';
import { PaginationDto } from 'src/common/dtos';
import { Method, Status } from '@prisma/client';
import { IsOptionalPaymentMethod, IsOptionalStatuses } from '../decorators';

export class GetAppointmentsDto extends PaginationDto {

  @IsOptionalSearch()
  readonly search?: string;

  @IsOptionalBoolean({ 
    booleanMessage: 'isPaid must be a boolean' 
  })
  readonly isPaid?: boolean;

  @IsOptionalBoolean({ 
    booleanMessage: 'isToday must be a boolean' 
  })
  readonly isToday?: boolean

  @IsOptionalBoolean({ 
    booleanMessage: 'isPast must be a boolean' 
  })
  readonly isPast?: boolean

  @IsOptionalBoolean({ 
    booleanMessage: 'isFuture must be a boolean' 
  })
  readonly isFuture?: boolean

  @IsOptionalStatuses()
  readonly status?: Status[];

  @IsOptionalPaymentMethod()
  readonly paymentMethod?: Method;
}
