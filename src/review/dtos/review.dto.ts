import { IsString, IsOptional, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class ReviewDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;
}

