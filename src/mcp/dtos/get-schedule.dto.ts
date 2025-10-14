import { IsNotEmpty, IsString } from 'class-validator';

export class GetScheduleDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;
}
