import { appointmentOutputSchema } from "@dab/validation";
import { createZodDto } from "nestjs-zod";

export class AppointmentResponseDto extends createZodDto(
    appointmentOutputSchema
) { }