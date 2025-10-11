import { Injectable } from "@nestjs/common";
import { CryptoHelper } from "./crypto.helper";
import { ConfigService } from "@nestjs/config";
import { randomInt } from 'crypto'

@Injectable()
export class OtpHelper {
    public readonly OTP_EXPIRES: number;
    
    constructor(
        private readonly cryptoHelper: CryptoHelper,
        private readonly config: ConfigService
    ) {
        this.OTP_EXPIRES = Number(this.config.get<string>('OTP_EXPIRES'));
    }

    async generateOtp() {
        const otp = randomInt(100000, 1000000).toString(); // 6 digit OTP
        const hashedOtp = await this.cryptoHelper.hashValue(otp);
        return { otp, hashedOtp };
    }

    getOtpExpiryDate() {
        return new Date(Date.now() + this.OTP_EXPIRES * 60 * 1000);
    }
}
