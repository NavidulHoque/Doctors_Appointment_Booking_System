import { IsNotEmpty, IsString } from "class-validator";
import { BaseAuthDto } from "./base-auth.dto";

export class ResetPasswordDto extends BaseAuthDto {

    @IsNotEmpty()
    @IsString()
    newPassword: string;
}