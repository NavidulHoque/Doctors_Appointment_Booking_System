import { messageOutputSchema } from "@dab/validation";
import { createZodDto } from "nestjs-zod";

export class MessageResponseDto extends createZodDto(messageOutputSchema) {}