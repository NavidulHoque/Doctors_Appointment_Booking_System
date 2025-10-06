import { BaseAuthDto } from "./base-auth.dto";
import { IsRequiredString } from "src/common/decorators";

export class VerifyOtpDto extends BaseAuthDto {

    @IsRequiredString("OTP is required")
    otp: string;
}