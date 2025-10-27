import { BaseAuthDto } from "./base-auth.dto";
import { IsRequiredPassword } from "src/common/decorators";

export class ResetPasswordDto extends BaseAuthDto {

    @IsRequiredPassword()
    readonly newPassword: string;
}