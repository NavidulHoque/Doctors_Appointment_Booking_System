import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  readonly patientId: string;

  @IsString()
  @IsNotEmpty()
  readonly doctorId: string;

  @Type(() => Date)
  @IsDate({ message: 'Date must be a valid date' })
  readonly date: Date;
}
