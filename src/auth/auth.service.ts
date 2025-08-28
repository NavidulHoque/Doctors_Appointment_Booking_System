import { Injectable } from '@nestjs/common';
import * as argon from "argon2";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegistrationDto } from './dto';
import { ComparePasswordService } from 'src/common/comparePassword.service';
import { FindEntityByIdService } from 'src/common/FindEntityById.service';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly handleErrorsService: HandleErrorsService,
    private readonly comparePasswordService: ComparePasswordService,
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
          this.handleErrorsService.throwConflictError("Email already exists");
        }
      }

      else {
        this.handleErrorsService.handleError(error)
      }
    }
  }

  async patientLogin(dto: LoginDto) {

    const { email, password: plainPassword } = dto

    try {
      const response = await this.login(email, plainPassword, "patient")

      return response
    }

    catch (error) {
      this.handleErrorsService.handleError(error)
    }
  }

  async adminLogin(dto: LoginDto) {

    const { email, password: plainPassword } = dto

    try {
      const response = await this.login(email, plainPassword, "admin")

      return response
    }

    catch (error) {
      this.handleErrorsService.handleError(error)
    }
  }

  async doctorLogin(dto: LoginDto) {

    const { email, password: plainPassword } = dto

    try {
      const response = await this.login(email, plainPassword, "doctor")

      return response
    }

    catch (error) {
      this.handleErrorsService.handleError(error)
    }
  }

  private async login(email: string, plainPassword: string, role: string): Promise<any> {

    const user = await this.fetchUserByEmail(email, "Specific Email is not registered yet, please register first")

    if (user?.role !== role.toUpperCase()) {
      this.handleErrorsService.throwUnauthorizedError(`${role} login only`);
    }

    const { password: hashedPassword, id } = user as any;

    const isMatched = await this.comparePasswordService.comparePassword(plainPassword, hashedPassword)

    if (!isMatched) {
      this.handleErrorsService.throwUnauthorizedError("Password invalid")
    }

    const payload = { id }

    const accessToken = this.generateAccessToken(payload)
    const refreshToken = this.generateRefreshToken(payload)

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        refreshToken,
        isOnline: true,
        lastActiveAt: new Date()
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        refreshToken: true
      },
    })

    return {
      message: 'Logged in successfully',
      data: updatedUser,
      accessToken
    }
  }

  async forgetPassword(email: string) {

    try {
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

    catch (error) {
      this.handleErrorsService.handleError(error)
    }
  }

  async verifyOtp(email: string, otp: string) {

    try {
      const user = await this.fetchUserByEmail(email, 'Invalid email')

      if (!user.otp || !user.otpExpires) {
        this.handleErrorsService.throwNotFoundError('Otp not found');
      }

      else if (user.otp !== otp) {
        this.handleErrorsService.throwBadRequestError('Invalid otp')
      }

      else if (new Date() > user.otpExpires) {
        this.handleErrorsService.throwBadRequestError('OTP expired, please request a new one')
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

    catch (error) {
      this.handleErrorsService.handleError(error)
    }
  }

  async resetPassword(email: string, newPassword: string) {
    try {
      const user = await this.fetchUserByEmail(email, 'Invalid email')

      const hashedPassword = await argon.hash(newPassword);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      return {
        message: 'Password reseted successfully',
      }
    }

    catch (error) {
      this.handleErrorsService.handleError(error)
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { refreshToken }
      })

      if (!user) {
        this.handleErrorsService.throwBadRequestError('Refresh token invalid');
      }

      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET')
      });

      if (!decoded || decoded.id !== user!.id) {
        this.handleErrorsService.throwBadRequestError('Refresh token invalid');
      }

      const accessToken = this.generateAccessToken({ id: user!.id })
      const newRefreshToken = this.generateRefreshToken({ id: user!.id })

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

    catch (error) {
      this.handleErrorsService.handleError(error);
    }
  }

  async logout(id: string) {

    try {
      const user = await this.findEntityByIdService.findEntityById('user', id, { isOnline: true })

      if (!user.isOnline) {
        this.handleErrorsService.throwForbiddenError('Cannot logout an offline user');
      }

      await this.prisma.user.update({
        where: { id },
        data: {
          refreshToken: null,
          isOnline: false,
          lastActiveAt: new Date()
        }
      })

      return {
        message: 'Logged out successfully'
      }
    }

    catch (error) {
      this.handleErrorsService.handleError(error);
    }
  }

  private generateAccessToken(payload: { id: string | undefined }) {

    const accessTokenSecrete = this.config.get<string>('ACCESS_TOKEN_SECRET')
    const accessTokenExpires = this.config.get<string>('ACCESS_TOKEN_EXPIRES')

    const accessToken = this.jwtService.sign(payload, { secret: accessTokenSecrete, expiresIn: accessTokenExpires });

    return accessToken
  }

  private generateRefreshToken(payload: { id: string | undefined }) {

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
      this.handleErrorsService.throwBadRequestError(errorMessage);
    }

    return user;
  }
}