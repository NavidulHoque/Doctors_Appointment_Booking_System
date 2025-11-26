import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const CreateAppointmentSchema = z.object({
  patientId: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional(),

  doctorId: z
    .string({
      required_error: "Doctor ID is required",
      invalid_type_error: "Doctor ID must be a string",
    })
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .uuid(),

  date: z.coerce.date().refine(
    (d) => d.getTime() > Date.now(),
    { message: "Date must be in the future" }
  ),
});

export class CreateAppointmentDto extends createZodDto(CreateAppointmentSchema) {}
