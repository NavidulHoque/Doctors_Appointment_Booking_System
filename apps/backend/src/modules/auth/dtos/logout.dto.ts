import { logoutSchema } from "@dab/validation";
import { createZodDto } from "nestjs-zod";

export class LogoutDto extends createZodDto(logoutSchema) {}