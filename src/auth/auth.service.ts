import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as argon from "argon2";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgetPasswordDto, RefreshAccessTokenDto, RegistrationDto, VerifyOtpDto, ResetPasswordDto, LogoutDto } from './dto';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';
import { EmailService } from 'src/email/email.service';
import { SmsService } from 'src/sms/sms.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {

  private readonly ACCESS_TOKEN_EXPIRES: string;
  private readonly REFRESH_TOKEN_EXPIRES: string;
  private readonly ACCESS_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly OTP_Expires: number;

  private readonly sessionSelect = {
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
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly findEntityByIdService: FindEntityByIdService,
    private readonly email: EmailService,
    private readonly sms: SmsService
  ) {
    this.ACCESS_TOKEN_EXPIRES = this.config.get<string>('ACCESS_TOKEN_EXPIRES')!;
    this.REFRESH_TOKEN_EXPIRES = this.config.get<string>('REFRESH_TOKEN_EXPIRES')!;
    this.ACCESS_TOKEN_SECRET = this.config.get<string>('ACCESS_TOKEN_SECRET')!;
    this.REFRESH_TOKEN_SECRET = this.config.get<string>('REFRESH_TOKEN_SECRET')!;
    this.OTP_Expires = Number(this.config.get<string>('OTP_EXPIRES'))
  }

  async register(dto: RegistrationDto) {

    const { password } = dto

    try {
      const hashedPassword = await argon.hash(password);

      dto.password = hashedPassword

      await this.prisma.user.create({ data: dto })

      return { message: 'User created successfully' }
    }

    catch (error) {
      // Prisma unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = error.meta?.target?.[0];

        if (target === 'email') {
          throw new ConflictException("Email already exists");
        }
      }

      throw error;
    }
  }

  async login({ email, password: plainPassword, deviceName, role }: any) {

    const user = await this.fetchUserByEmail(email, "Specific Email is not registered yet, please register first")

    if (user.role !== role) {
      throw new UnauthorizedException(`${role} login only`);
    }

    const { password: hashedPassword, id: userId } = user as any;

    const isMatched = await argon.verify(hashedPassword, plainPassword)

    if (!isMatched) {
      throw new UnauthorizedException("Password invalid")
    }

    const { id: sessionId } = await this.prisma.session.create({
      data: {
        userId,
        deviceName: deviceName || null,
        refreshToken: "abc",
        expiresAt: new Date()
      },
      select: {
        id: true
      }
    })

    const payload = { id: userId, role, email }

    const accessToken = this.generateAccessToken(payload)
    const refreshToken = this.generateRefreshToken({
      ...payload,
      sessionId
    })

    const hashedRefreshToken = await argon.hash(refreshToken);

    const refreshTokenExpires = this.generateParsedExpiry(this.REFRESH_TOKEN_EXPIRES)

    const [_, session] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          isOnline: true,
          lastActiveAt: new Date()
        }
      }),
      this.prisma.session.update({
        where: { id: sessionId },
        data: {
          refreshToken: hashedRefreshToken,
          expiresAt: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000)
        },
        select: this.sessionSelect
      })
    ]);

    return {
      message: 'Logged in successfully',
      session,
      accessToken,
      refreshToken
    }
  }

  async forgetPassword(dto: ForgetPasswordDto) {

    const { email } = dto

    const user = await this.fetchUserByEmail(email, 'Invalid Email')

    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const otpExpires = new Date(Date.now() + this.OTP_Expires * 60 * 1000)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpires
      }
    })

    this.email.sendOtpEmail(user.email, otp)
    if (user.phone) {
      this.sms.sendSms(user.phone, `Your OTP code is ${otp}. It will expire in ${this.OTP_Expires} minutes.`);
    }

    return {
      message: 'Otp emailed and sms successfully',
    }
  }

  async verifyOtp(dto: VerifyOtpDto) {

    const { email, otp } = dto

    const user = await this.fetchUserByEmail(email, 'Invalid email')

    if (!user.otp || !user.otpExpires) {
      throw new NotFoundException('Otp not found');
    }

    else if (user.otp !== otp) {
      throw new BadRequestException('Invalid otp')
    }

    else if (new Date() > user.otpExpires) {

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

    const user = await this.fetchUserByEmail(email, 'Invalid email')

    if (user.otp || user.otpExpires || !user.isOtpVerified) {
      throw new UnauthorizedException('Please verify otp first');
    }

    const hashedPassword = await argon.hash(newPassword);

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

  async refreshAccessToken(dto: RefreshAccessTokenDto) {

    const { refreshToken } = dto;

    let payload: { sessionId: string, id: string, role: string, email: string }

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.REFRESH_TOKEN_SECRET
      });
    }

    catch (error) {

      const decoded = this.jwtService.decode(refreshToken);
      const sessionId = decoded.sessionId;

      if (sessionId) {
        await this.deleteSession(sessionId);
      }

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
    const session = await this.findEntityByIdService.findEntityById('session', sessionId,
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

    const isMatched = await argon.verify(session.refreshToken, refreshToken)

    if (!isMatched) {
      await this.deleteSession(sessionId);
      throw new BadRequestException('Refresh token invalid, please login again');
    }

    else if (new Date() > session.expiresAt) {
      await this.deleteSession(sessionId);
      throw new UnauthorizedException("Session expired, please login again");
    }

    const accessToken = this.generateAccessToken(session.user)
    const newRefreshToken = this.generateRefreshToken({ ...session.user, sessionId })

    const hashedNewRefreshToken = await argon.hash(newRefreshToken);

    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshToken: hashedNewRefreshToken,
        expiresAt: new Date(Date.now() + Number(this.generateParsedExpiry(this.REFRESH_TOKEN_EXPIRES)) * 24 * 60 * 60 * 1000)
      },
      select: this.sessionSelect
    })

    return {
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken,
      session: updatedSession
    }
  }

  async logout(dto: LogoutDto) {

    const { sessionId } = dto

    const session = await this.findEntityByIdService.findEntityById('session', sessionId, { user: { select: { id: true } } })

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

    return {
      message: 'Logged out successfully'
    }
  }

  private async deleteSession(sessionId: string) {
    await this.prisma.session.delete({
      where: { id: sessionId }
    })
  }

  private generateParsedExpiry(expiresIn: string) {
    return Number(expiresIn.replace(/\D/g, ''))
  }

  private generateAccessToken(payload: { id: string, role: string, email: string }) {
    return this.jwtService.sign(payload, { secret: this.ACCESS_TOKEN_SECRET, expiresIn: this.ACCESS_TOKEN_EXPIRES });
  }

  private generateRefreshToken(payload: { id: string, role: string, email: string, sessionId: string }) {
    return this.jwtService.sign(payload, { secret: this.REFRESH_TOKEN_SECRET, expiresIn: this.REFRESH_TOKEN_EXPIRES });
  }

  private async fetchUserByEmail(email: string, errorMessage: string): Promise<any> {

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        password: true,
        otp: true,
        otpExpires: true,
        isOtpVerified: true
      }
    });

    if (!user) {
      throw new BadRequestException(errorMessage);
    }

    return user;
  }
}