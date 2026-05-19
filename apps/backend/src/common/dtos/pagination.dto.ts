import { PaginationSchema } from "@dab/validation";
import { createZodDto } from "nestjs-zod";

export class PaginationDto extends createZodDto(PaginationSchema) {}