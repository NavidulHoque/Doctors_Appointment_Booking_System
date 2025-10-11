import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgetPasswordDto, RegistrationDto, VerifyOtpDto, ResetPasswordDto, LogoutDto, SessionResponseDto } from './dto';
import { EmailService } from 'src/email/email.service';
import { SmsService } from 'src/sms/sms.service';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { LoginPayload, RefreshTokenPayload } from './interfaces';
import { randomUUID } from 'crypto';
import { sessionSelect } from './prisma-selects';
import { TokenHelper } from './helpers/token.helper';
import { CryptoHelper } from './helpers/crypto.helper';
import { OtpHelper } from './helpers/otp.helper';
import { CookieHelper } from './helpers/cookie.helper';
import { SessionUserHelper } from './helpers/session-user.helper';
import { AuthNotificationHelper } from './helpers/notification.helper';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
    private readonly tokenHelper: TokenHelper,
    private readonly cryptoHelper: CryptoHelper,
    private readonly otpHelper: OtpHelper,
    private readonly cookieHelper: CookieHelper,
    private readonly sessionUserHelper: SessionUserHelper,
    private readonly notificationHelper: AuthNotificationHelper
  ) { }

  async register(dto: RegistrationDto) {

    const { password } = dto

    try {
      const hashedPassword = await this.cryptoHelper.hashValue(password);

      const userData = { ...dto, password: hashedPassword };

      await this.prisma.user.create({ data: userData })

      return { message: 'User created successfully' }
    }

    catch (error) {
      // Prisma unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target;
        const fields = Array.isArray(target) ? target.join(', ') : String(target || 'field(s)');
        throw new ConflictException(`${fields} already exists`);
      }

      throw error;
    }
  }

  async login({ email, password: plainPassword, deviceName, role }: LoginPayload, res: Response) {

    const user = await this.sessionUserHelper.fetchUserByEmail(email, 'Invalid credentials')

    if (user.role !== role) {
      throw new UnauthorizedException(`${role} login only`);
    }

    const { password: hashedPassword, id: userId } = user;

    const isMatched = await this.cryptoHelper.verifyHash(hashedPassword, plainPassword)

    if (!isMatched) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const sessionId = randomUUID();

    const payload = { id: userId, role, email }

    const accessToken = this.tokenHelper.generateAccessToken(payload)
    const refreshToken = this.tokenHelper.generateRefreshToken({
      ...payload,
      sessionId
    })

    const hashedRefreshToken = await this.cryptoHelper.hashValue(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.cookieHelper.convertExpiryToMs(this.tokenHelper.REFRESH_TOKEN_EXPIRES));

    const [_, session] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: true,
          lastActiveAt: new Date()
        }
      }),
      this.prisma.session.create({
        data: {
          id: sessionId,
          userId,
          deviceName,
          refreshToken: hashedRefreshToken,
          expiresAt: refreshExpiresAt
        },
        select: sessionSelect
      })
    ]);

    this.cookieHelper.setAuthCookies(res, accessToken, refreshToken);

    return {
      message: 'Logged in successfully',
      session: new SessionResponseDto(session),
    }
  }

  async forgetPassword(dto: ForgetPasswordDto, traceId: string) {

    const { email } = dto

    const user = await this.sessionUserHelper.fetchUserByEmail(email, "Invalid credentials")

    const { otp, hashedOtp } = await this.otpHelper.generateOtp()
    const otpExpires = this.otpHelper.getOtpExpiryDate()

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: hashedOtp,
        otpExpires
      }
    })

    this.email.sendOtpEmail(user.email, otp).catch((error) =>
      this.notificationHelper.handleNotificationFailure('email otp', error, user, traceId)
    );

    if (user.phone) {
      this.sms
        .sendSms(
          user.phone,
          `Your OTP code is ${otp}. It will expire in ${this.otpHelper.OTP_EXPIRES} minutes.`
        )
        .catch((error) =>
          this.notificationHelper.handleNotificationFailure('send otp via sms', error, user, traceId)
        );
    }

    return {
      message: 'Otp is send via email and sms successfully',
    }
  }

  async verifyOtp(dto: VerifyOtpDto) {

    const { email, otp } = dto

    const user = await this.sessionUserHelper.fetchUserByEmail(email, "Invalid credentials")

    if (!user.otp || !user.otpExpires) {
      throw new NotFoundException('Otp not found');
    }

    if (new Date() > user.otpExpires) {

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          otp: null,
          otpExpires: null,
          isOtpVerified: false
        }
      })

      throw new BadRequestException('OTP expired, please request a new one')
    }

    const isOtpValid = await this.cryptoHelper.verifyHash(user.otp, otp)

    if (!isOtpValid) {
      throw new BadRequestException('Invalid otp');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpires: null,
        isOtpVerified: true
      }
    })

    return {
      message: 'Otp verified successfully',
    }
  }

  async resetPassword(dto: ResetPasswordDto) {

    const { email, newPassword } = dto

    const user = await this.sessionUserHelper.fetchUserByEmail(email, "Password reset request invalid or expired.")

    if (user.otp || user.otpExpires || !user.isOtpVerified) {
      throw new UnauthorizedException('Please verify otp first');
    }

    const hashedPassword = await this.cryptoHelper.hashValue(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isOtpVerified: false
      }
    })

    return {
      message: 'Password reseted successfully',
    }
  }

  async refreshAccessToken(refreshToken: string, res: Response) {

    let payload: RefreshTokenPayload

    try {
      payload = this.tokenHelper.verifyRefreshToken(refreshToken);
    }

    catch (error) {
      switch (error.name) {

        case "TokenExpiredError":
          throw new UnauthorizedException("Token expired, please login again");

        case "JsonWebTokenError":
          throw new UnauthorizedException("Invalid token, please login again");

        case "NotBeforeError":
          throw new UnauthorizedException("Token not active yet, please login again");

        default:
          throw error;
      }
    }

    const { sessionId } = payload;
    const session = await this.sessionUserHelper.findSessionById(sessionId);

    if (session.user.id !== payload.id) {
      await this.sessionUserHelper.deleteSession(sessionId);
      throw new BadRequestException('Token invalid, please login again');
    }

    const isMatched = await this.cryptoHelper.verifyHash(session.refreshToken, refreshToken)

    if (!isMatched) {
      await this.sessionUserHelper.deleteSession(sessionId);
      throw new BadRequestException('Refresh token invalid, please login again');
    }

    else if (new Date() > session.expiresAt) {
      await this.sessionUserHelper.deleteSession(sessionId);
      throw new UnauthorizedException("Session expired, please login again");
    }

    const accessToken = this.tokenHelper.generateAccessToken(session.user)
    const newRefreshToken = this.tokenHelper.generateRefreshToken({
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
      sessionId
    })

    const hashedNewRefreshToken = await this.cryptoHelper.hashValue(newRefreshToken);

    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken: hashedNewRefreshToken,
        expiresAt: new Date(Date.now() + this.cookieHelper.convertExpiryToMs(this.tokenHelper.REFRESH_TOKEN_EXPIRES))
      },
      select: sessionSelect
    })

    this.cookieHelper.setAuthCookies(res, accessToken, newRefreshToken);

    return {
      message: 'Token refreshed successfully',
      session: new SessionResponseDto(updatedSession)
    }
  }

  async logout(dto: LogoutDto, res: Response) {

    const { sessionId } = dto

    const session = await this.sessionUserHelper.findSessionById(sessionId)

    await this.prisma.$transaction([

      this.prisma.session.delete({
        where: { id: sessionId },
      }),

      this.prisma.user.update({
        where: { id: session.user.id },
        data: {
          isOnline: false,
          lastActiveAt: new Date()
        }
      })
    ])

    this.cookieHelper.clearAuthCookies(res);

    return {
      message: 'Logged out successfully'
    }
  }
}