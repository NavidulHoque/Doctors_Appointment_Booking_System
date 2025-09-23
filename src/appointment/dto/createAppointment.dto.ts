import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, Validate, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'FutureDate', async: false })
export class FutureDate implements ValidatorConstraintInterface {
  validate(value: Date) {
    return value.getTime() > Date.now();
  }

  defaultMessage() {
    return 'Date must be in the future';
  }
}

export class CreateAppointmentDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  patientId?: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  readonly doctorId: string;

  @Type(() => Date)
  @IsDate({ message: "Date must be a valid date" })
  @Validate(FutureDate)
  readonly date: Date;
}
