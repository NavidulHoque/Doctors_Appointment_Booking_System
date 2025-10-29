import { BaseAuthDto } from "./base-auth.dto";
import { IsRequiredOTP } from "src/common/decorators";

export class VerifyOtpDto extends BaseAuthDto {

    @IsRequiredOTP()
    readonly otp: string;
}