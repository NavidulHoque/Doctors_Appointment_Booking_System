import { Type } from "class-transformer";
import { IsDate, Validate, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { IsOptionalString, IsRequiredString } from "src/common/decorators";

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
  @IsOptionalString({ stringMessage: "Patient ID must be a string" })
  patientId?: string;

  @IsRequiredString({ requiredMessage: "Doctor ID is required", stringMessage: "Doctor ID must be a string", isUUID: true})
  readonly doctorId: string;

  @Type(() => Date) // convert to javascript Date object
  @IsDate({ message: "Date must be a valid date" })
  @Validate(FutureDate)
  readonly date: Date;
}
