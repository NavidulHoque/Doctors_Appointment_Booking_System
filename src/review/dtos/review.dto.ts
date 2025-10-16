import { IsString, IsOptional, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { IsOptionalString, IsRequiredNumber, IsRequiredString } from 'src/common/decorators';

export class ReviewDto {
  @IsRequiredString({
    requiredMessage: 'Doctor ID is required',
    stringMessage: 'Doctor ID must be a string',
  })
  readonly doctorId: string;

  @IsOptionalString({
    stringMessage: 'Comment must be a string'
  })
  readonly comment?: string;

  @IsRequiredNumber({
    requiredMessage: 'Rating is required',
    numberMessage: 'Rating must be a number',
    min: 1,
    minMessage: 'Rating must be at least 1',
    max: 5,
    maxMessage: 'Rating must be at most 5',
  })
  readonly rating: number;
}

