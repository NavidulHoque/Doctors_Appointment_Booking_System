import { IsOptionalString, IsRequiredUUID } from 'src/common/decorators/string';
import { IsRequiredRating } from '../decorators';

export class ReviewDto {
  @IsRequiredUUID({
    requiredMessage: 'Doctor ID is required',
    stringMessage: 'Doctor ID must be a string',
  })
  readonly doctorId: string;

  @IsOptionalString({
    stringMessage: 'Comment must be a string'
  })
  readonly comment?: string;

  @IsRequiredRating()
  readonly rating: number;
}

