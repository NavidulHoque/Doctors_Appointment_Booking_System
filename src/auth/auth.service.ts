import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgetPasswordDto, RegistrationDto, VerifyOtpDto, ResetPasswordDto, LogoutDto, SessionResponseDto } from './dto';
import { EmailService } from 'src/email/email.service';
import { SmsService } from 'src/sms/sms.service';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { AuthHelperService } from './auth-helper.service';
import { LoginPayload } from './interfaces';
import { SessionWithUser } from './types';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly sessionSelect: Prisma.SessionSelect = {
    id: true,
    deviceName: true,
    user: {
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    }
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
    private readonly authHelper: AuthHelperService
  ) { }

  async register(dto: RegistrationDto) {

    const { password } = dto

    try {
      const hashedPassword = await this.authHelper.hashValue(password);

      const userData = { ...dto, password: hashedPassword };

      await this.prisma.user.create({ data: userData })

      return { message: 'User created successfully' }
    }

    catch (error) {
      // Prisma unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target;

        const fields = Array.isArray(target) ? target.join(', ') : 'field(s)';

        if (fields.includes('email')) {
          throw new ConflictException('Email already exists');
        }
      }

      throw error;
    }
  }

  async login({ email, password: plainPassword, deviceName, role }: LoginPayload, res: Response) {

    const user = await this.authHelper.fetchUserByEmail(email, "Please create an account first")

    if (user.role !== role) {
      throw new UnauthorizedException(`${role} login only`);
    }

    const { password: hashedPassword, id: userId } = user;

    const isMatched = await this.authHelper.verifyHash(hashedPassword, plainPassword)

    if (!isMatched) {
      throw new UnauthorizedException("Invalid credentials")
    }

    const sessionId = randomUUID();

    const payload = { id: userId, role, email }

    const accessToken = this.authHelper.generateAccessToken(payload)
    const refreshToken = this.authHelper.generateRefreshToken({
      ...payload,
      sessionId
    })

    const hashedRefreshToken = await this.authHelper.hashValue(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.authHelper.convertExpiryToMs(this.authHelper.REFRESH_TOKEN_EXPIRES));

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
        select: this.sessionSelect
      })
    ]);

    this.authHelper.setAuthCookies(res, accessToken, refreshToken);

    return {
      message: 'Logged in successfully',
      session: new SessionResponseDto(session as SessionWithUser),
    }
  }

  async forgetPassword(dto: ForgetPasswordDto, traceId: string) {

    const { email } = dto

    const user = await this.authHelper.fetchUserByEmail(email, "Invalid credentials")

    const { otp, hashedOtp } = await this.authHelper.generateOtp()
    const otpExpires = this.authHelper.getOtpExpiryDate()

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: hashedOtp,
        otpExpires
      }
    })

    this.email.sendOtpEmail(user.email, otp).catch((error) =>
      this.authHelper.handleNotificationFailure('email otp', error, user, traceId)
    );

    if (user.phone) {
      this.sms
        .sendSms(
          user.phone,
          `Your OTP code is ${otp}. It will expire in ${this.authHelper.OTP_EXPIRES} minutes.`
        )
        .catch((error) =>
          this.authHelper.handleNotificationFailure('send otp via sms', error, user, traceId)
        );
    }

    return {
      message: 'Otp is send via email and sms successfully',
    }
  }

  async verifyOtp(dto: VerifyOtpDto) {

    const { email, otp } = dto

    const user = await this.authHelper.fetchUserByEmail(email, "Invalid credentials")

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

    const isOtpValid = await this.authHelper.verifyHash(user.otp, otp)

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

    const user = await this.authHelper.fetchUserByEmail(email, 'Invalid credentials')

    if (user.otp || user.otpExpires || !user.isOtpVerified) {
      throw new UnauthorizedException('Please verify otp first');
    }

    const hashedPassword = await this.authHelper.hashValue(newPassword);

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

    let payload: { sessionId: string, id: string, role: string, email: string }

    try {
      payload = this.authHelper.verifyRefreshToken(refreshToken);
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
    const session = await this.authHelper.findSessionById(sessionId,
      {
        refreshToken: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            role: true,
            email: true
          }
        }
      }
    );

    if (session.user.id !== payload.id) {
      await this.authHelper.deleteSession(sessionId);
      throw new BadRequestException('Token invalid, please login again');
    }

    const isMatched = await this.authHelper.verifyHash(session.refreshToken, refreshToken)

    if (!isMatched) {
      await this.authHelper.deleteSession(sessionId);
      throw new BadRequestException('Refresh token invalid, please login again');
    }

    else if (new Date() > session.expiresAt) {
      await this.authHelper.deleteSession(sessionId);
      throw new UnauthorizedException("Session expired, please login again");
    }

    const accessToken = this.authHelper.generateAccessToken(session.user)
    const newRefreshToken = this.authHelper.generateRefreshToken({
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
      sessionId
    })

    const hashedNewRefreshToken = await this.authHelper.hashValue(newRefreshToken);

    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken: hashedNewRefreshToken,
        expiresAt: new Date(Date.now() + this.authHelper.convertExpiryToMs(this.authHelper.REFRESH_TOKEN_EXPIRES))
      },
      select: this.sessionSelect
    })

    this.authHelper.setAuthCookies(res, accessToken, newRefreshToken);

    return {
      message: 'Token refreshed successfully',
      session: new SessionResponseDto(updatedSession as SessionWithUser)
    }
  }

  async logout(dto: LogoutDto, res: Response) {

    const { sessionId } = dto

    const session = await this.authHelper.findSessionById(sessionId, { user: { select: { id: true } } })

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

    this.authHelper.clearAuthCookies(res);

    return {
      message: 'Logged out successfully'
    }
  }
}