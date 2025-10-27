import { BaseAuthDto } from "./base-auth.dto";
import { IsRequiredOtp } from "src/common/decorators";

export class VerifyOtpDto extends BaseAuthDto {

    @IsRequiredOtp()
    readonly otp: string;
}