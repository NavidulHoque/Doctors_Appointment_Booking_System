import { IsRequiredString } from "src/common/decorators";

export class LogoutDto {
  @IsRequiredString('Session ID is required')
  sessionId: string
}