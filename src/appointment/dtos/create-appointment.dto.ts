import { IsOptionalString, IsRequiredString, IsDateField, IsRequiredUUID } from "src/common/decorators";

export class CreateAppointmentDto {
  @IsOptionalString({ 
    stringMessage: "Patient ID must be a string" 
  })
  readonly patientId?: string;

  @IsRequiredUUID({ 
    requiredMessage: "Doctor ID is required", 
    stringMessage: "Doctor ID must be a string", 
  })
  readonly doctorId: string;

  @IsDateField({
    dateMessage: "Date must be a valid date",
    comparisonType: "future",
    comparisonMessage: "Date must be in the future",
  })
  readonly date: Date;
}
