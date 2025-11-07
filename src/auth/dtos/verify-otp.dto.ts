import { BaseAuthDto } from "./base-auth.dto";
import { IsRequiredOTP } from "../decorators";

export class VerifyOtpDto extends BaseAuthDto {

    @IsRequiredOTP()
    readonly otp: string;
}