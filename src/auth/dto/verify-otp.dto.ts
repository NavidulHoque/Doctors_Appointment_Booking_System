import { IsNotEmpty, IsString } from "class-validator";
import { BaseAuthDto } from "./base-auth.dto";

export class VerifyOtpDto extends BaseAuthDto {

    @IsNotEmpty()
    @IsString()
    otp: string;
}