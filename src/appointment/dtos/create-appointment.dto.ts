import { IsOptionalString, IsRequiredUUID } from "src/common/decorators";
import { IsRequiredFutureDate } from "../decorators";

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

  @IsRequiredFutureDate()
  readonly date: Date;
}
