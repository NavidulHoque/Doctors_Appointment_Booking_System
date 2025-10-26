import { Injectable } from "@nestjs/common";
import { CryptoHelper } from "./crypto.helper";
import { randomInt } from 'crypto'
import { AppConfigService } from "src/config";

@Injectable()
export class OtpHelper {
    
    constructor(
        private readonly cryptoHelper: CryptoHelper,
        private readonly config: AppConfigService
    ) {}

    async generateOtp() {
        const otp = randomInt(100000, 1000000).toString(); // 6 digit OTP
        const hashedOtp = await this.cryptoHelper.hashValue(otp);
        return { otp, hashedOtp };
    }

    get otpExpiryDate() {
        return new Date(Date.now() + this.config.otp * 60 * 1000);
    }
}
