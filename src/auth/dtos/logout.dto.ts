import { IsRequiredUUID } from "src/common/decorators/string";

export class LogoutDto {
  @IsRequiredUUID({
    requiredMessage: "Session ID is required",
    stringMessage: "Session ID must be a string"
  })
  readonly sessionId: string
}