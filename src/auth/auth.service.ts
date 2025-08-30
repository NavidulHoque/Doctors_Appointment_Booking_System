import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as argon from "argon2";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgetPasswordDto, LoginDto, RefreshAccessTokenDto, RegistrationDto, VerifyOtpDto, ResetPasswordDto } from './dto';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';

@Injectable()
export class AuthService {

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
  ) { }

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
      if (error.code === 'P2002') {
        const target = error.meta?.target?.[0];

        if (target === 'email') {
          throw new ConflictException("Email already exists");
        }
      }

      throw error;
    }
  }

  async patientLogin(dto: LoginDto) {

    const { email, password: plainPassword, deviceName } = dto

    const response = await this.login(email, plainPassword, deviceName ?? null, "patient")

    return response
  }

  async adminLogin(dto: LoginDto) {

    const { email, password: plainPassword, deviceName } = dto

    const response = await this.login(email, plainPassword, deviceName ?? null, "admin")

    return response
  }

  async doctorLogin(dto: LoginDto) {

    const { email, password: plainPassword, deviceName } = dto

    const response = await this.login(email, plainPassword, deviceName ?? null, "doctor")

    return response
  }

  private async login(email: string, plainPassword: string, deviceName: string | null, role: string): Promise<any> {

    const user = await this.fetchUserByEmail(email, "Specific Email is not registered yet, please register first")

    if (user.role !== role.toUpperCase()) {
      throw new UnauthorizedException(`${role} login only`);
    }

    const { password: hashedPassword, id: userId } = user as any;

    const isMatched = await argon.verify(hashedPassword, plainPassword)

    if (!isMatched) {
      throw new UnauthorizedException("Password invalid")
    }

    const payload = { id: userId, role, email }

    const accessToken = this.generateAccessToken(payload)
    const refreshToken = this.generateRefreshToken(payload)

    const hashedRefreshToken = await argon.hash(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastActiveAt: new Date()
      }
    })

    const session = await this.prisma.session.create({
      data: {
        userId,
        deviceName: deviceName,
        refreshToken: hashedRefreshToken
      },
      select: this.sessionSelect
    });

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

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + Number(this.config.get<number>('OTP_EXPIRES')) * 60 * 1000)

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: otp.toString(),
        otpExpires
      }
    })

    return {
      message: 'Otp sent successfully'
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

      await this.nullifyUserOtp(user.id)
      throw new BadRequestException('OTP expired, please request a new one')
    }

    await this.nullifyUserOtp(user.id)

    return {
      message: 'Otp verified successfully',
    }
  }

  private async nullifyUserOtp(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        otp: null,
        otpExpires: null
      }
    })
  }

  async resetPassword(dto: ResetPasswordDto) {

    const { email, newPassword } = dto

    const user = await this.fetchUserByEmail(email, 'Invalid email')

    if (user.otp || user.otpExpires) {
      throw new UnauthorizedException('Please verify otp first');
    }

    else if (!user.isOtpVerified) {
      throw new UnauthorizedException('Please verify otp first');
    }

    const hashedPassword = await argon.hash(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    })

    return {
      message: 'Password reseted successfully',
    }
  }

  async refreshAccessToken(dto: RefreshAccessTokenDto) {

    const { sessionId, refreshToken } = dto;

    const session = await this.findEntityByIdService.findEntityById('session', sessionId,
      {
        refreshToken: true,
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

    try {
      if (!isMatched) {
        throw new BadRequestException('Refresh token invalid');
      }

      this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET')
      });
    }

    catch (error) {
      await this.prisma.session.delete({
        where: { id: sessionId },
      })

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

    const { id, role, email } = session.user;

    const accessToken = this.generateAccessToken({ id, role, email })
    const newRefreshToken = this.generateRefreshToken({ id, role, email })

    const hashedNewRefreshToken = await argon.hash(newRefreshToken);

    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: { refreshToken: hashedNewRefreshToken },
      select: this.sessionSelect
    })

    return {
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken,
      session: updatedSession
    }
  }

  async logout(sessionId: string) {

    await this.findEntityByIdService.findEntityById('session', sessionId, null)

    await this.prisma.session.delete({
      where: { id: sessionId },
    })

    return {
      message: 'Logged out successfully'
    }
  }

  private generateAccessToken(payload: { id: string, role: string, email: string }) {

    const accessTokenSecrete = this.config.get<string>('ACCESS_TOKEN_SECRET')
    const accessTokenExpires = this.config.get<string>('ACCESS_TOKEN_EXPIRES')

    const accessToken = this.jwtService.sign(payload, { secret: accessTokenSecrete, expiresIn: accessTokenExpires });

    return accessToken
  }

  private generateRefreshToken(payload: { id: string, role: string, email: string }) {

    const refreshTokenSecrete = this.config.get<string>('REFRESH_TOKEN_SECRET')
    const refreshTokenExpires = this.config.get<string>('REFRESH_TOKEN_EXPIRES')

    const refreshToken = this.jwtService.sign(payload, { secret: refreshTokenSecrete, expiresIn: refreshTokenExpires });

    return refreshToken
  }

  private async fetchUserByEmail(email: string, errorMessage: string): Promise<any> {

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        password: true,
        otp: true,
        otpExpires: true
      }
    });

    if (!user) {
      throw new BadRequestException(errorMessage);
    }

    return user;
  }
}