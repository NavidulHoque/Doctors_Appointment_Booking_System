import { BaseAuthDto } from "./base-auth.dto";
import { IsRequiredString } from "src/common/decorators";

export class VerifyOtpDto extends BaseAuthDto {

    @IsRequiredString({
        requiredMessage: 'OTP is required',
        stringMessage: 'OTP must be a string',
        matches: {
            pattern: /^\d{6}$/,
            message: 'OTP must be a 6-digit number'
        }
    })
    readonly otp: string;
}