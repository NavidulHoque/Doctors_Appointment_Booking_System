import { doctorOutputSchema } from "@dab/validation";
import { createZodDto } from "nestjs-zod/dto";

export class DoctorResponseDto extends createZodDto(doctorOutputSchema) {}