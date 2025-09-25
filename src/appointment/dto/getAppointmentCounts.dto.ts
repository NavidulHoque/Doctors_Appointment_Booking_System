import { IsOptional, IsString } from 'class-validator';

export class GetAppointmentCountsDto {

  @IsOptional()
  @IsString()
  readonly doctorId?: string;

  @IsOptional()
  @IsString()
  readonly patientId?: string;
}
