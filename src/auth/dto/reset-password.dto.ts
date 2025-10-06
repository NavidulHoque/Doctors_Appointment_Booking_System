import { BaseAuthDto } from "./base-auth.dto";
import { IsRequiredString } from "src/common/decorators";

export class ResetPasswordDto extends BaseAuthDto {

    @IsRequiredString("New password is required")
    newPassword: string;
}