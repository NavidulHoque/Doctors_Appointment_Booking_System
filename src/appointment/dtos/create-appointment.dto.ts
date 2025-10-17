import { IsOptionalString, IsRequiredString, IsDateField } from "src/common/decorators";

export class CreateAppointmentDto {
  @IsOptionalString({ 
    stringMessage: "Patient ID must be a string" 
  })
  readonly patientId?: string;

  @IsRequiredString({ 
    requiredMessage: "Doctor ID is required", 
    stringMessage: "Doctor ID must be a string", 
    isUUID: true 
  })
  readonly doctorId: string;

  @IsDateField({
    dateMessage: "Date must be a valid date",
    comparisonType: "future",
    comparisonMessage: "Date must be in the future",
  })
  readonly date: Date;
}
