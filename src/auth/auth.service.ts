import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as argon from "argon2";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { ForgetPasswordDto, LoginDto, RefreshAccessTokenDto, RegistrationDto, VerifyOtpDto, ResetPasswordDto } from './dto';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';

@Injectable()
export class AuthService {

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

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: true,
        lastActiveAt: new Date()
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      },
    })

    const session = await this.prisma.session.create({
      data: {
        userId,
        deviceName: deviceName,
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + Number(this.config.get<number>('REFRESH_TOKEN_EXPIRES')) * 60 * 1000),
      }
    });

    return {
      message: 'Logged in successfully',
      data: updatedUser,
      session,
      accessToken
    }
  }

  async forgetPassword(dto: ForgetPasswordDto) {

    const { email } = dto

    const user = await this.fetchUserByEmail(email, 'Invalid Email')

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + Number(this.config.get<number>('OTP_EXPIRES')) * 60 * 1000)

    await this.prisma.user.update({
      where: { id: user!.id },
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
      throw new BadRequestException('OTP expired, please request a new one')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpires: null
      }
    })

    return {
      message: 'Otp verified successfully',
    }
  }

  async resetPassword(dto: ResetPasswordDto) {

    const { email, newPassword } = dto

    const user = await this.fetchUserByEmail(email, 'Invalid email')

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
    const session = await this.findEntityByIdService.findEntityById('session', sessionId, { refreshToken: true });

    const decoded = this.jwtService.verify(refreshToken, {
      secret: this.config.get<string>('REFRESH_TOKEN_SECRET')
    });

    if (!decoded || decoded.id !== user!.id) {
      throw new BadRequestException('Refresh token invalid');
    }

    const { id, role, email } = user as any;

    const accessToken = this.generateAccessToken({ id, role, email })
    const newRefreshToken = this.generateRefreshToken({ id, role, email })

    await this.prisma.user.update({
      where: { id: user!.id },
      data: { refreshToken: newRefreshToken }
    })

    return {
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken
    }
  }

  async logout(id: string) {

    await this.findEntityByIdService.findEntityById('user', id, null)

    await this.prisma.user.update({
      where: { id },
      data: {
        refreshToken: [],
        isOnline: false,
        lastActiveAt: new Date()
      }
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