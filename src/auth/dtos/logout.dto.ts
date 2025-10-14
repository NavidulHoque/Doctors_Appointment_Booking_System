import { IsRequiredString } from "src/common/decorators";

export class LogoutDto {
  @IsRequiredString({ 
    requiredMessage: "Session ID is required", 
    stringMessage: "Session ID must be a string",
    isUUID: true
  })
  sessionId: string
}