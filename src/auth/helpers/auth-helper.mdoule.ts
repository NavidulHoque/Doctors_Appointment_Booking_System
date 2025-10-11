import { Global, Module } from "@nestjs/common";
import { TokenHelper } from "./token.helper";
import { CryptoHelper } from "./crypto.helper";
import { OtpHelper } from "./otp.helper";
import { CookieHelper } from "./cookie.helper";
import { SessionUserHelper } from "./session-user.helper";
import { AuthNotificationHelper } from "./notification.helper";

@Global()
@Module({
  providers: [
    TokenHelper,
    CryptoHelper,
    OtpHelper,
    CookieHelper,
    SessionUserHelper,
    AuthNotificationHelper
  ],
  exports: [
    TokenHelper,
    CryptoHelper,
    OtpHelper,
    CookieHelper,
    SessionUserHelper,
    AuthNotificationHelper
  ]
})
export class AuthHelperModule {}
