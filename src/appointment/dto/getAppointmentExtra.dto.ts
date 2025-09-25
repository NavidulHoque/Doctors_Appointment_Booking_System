import { IsOptional, IsString } from 'class-validator';

export class GetAppointmentExtraDto {

  @IsOptional()
  @IsString()
  readonly doctorId?: string;

  @IsOptional()
  @IsString()
  readonly patientId?: string;
}
