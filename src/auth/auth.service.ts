import { Injectable } from '@nestjs/common';
import * as argon from "argon2";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { FetchUserService } from 'src/common/fetchUser.service';
import { LoginDto, RegistrationDto } from './dto';
import { ComparePasswordService } from 'src/common/comparePassword.service';

@Injectable({})
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly handleErrorsService: HandleErrorsService,
    private readonly fetchUserService: FetchUserService,
    private readonly comparePasswordService: ComparePasswordService
  ) { }

  async register(dto: RegistrationDto) {

    const { email, password } = dto

    try {

      const user = await this.fetchUserService.fetchUser(email)

      if (user) this.handleErrorsService.throwBadRequestError("User already exists")

      const hashedPassword = await argon.hash(password);

      dto.password = hashedPassword

      await this.prisma.user.create({ data: dto })

      return { message: 'User created successfully' }
    }

    catch (error) {
      this.handleErrorsService.handleError(error)
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

    const user = await this.fetchUserService.fetchUser(email)

    if (!user) this.handleErrorsService.throwBadRequestError("User not found");

    if (user?.role.toLowerCase() !== role) this.handleErrorsService.throwForbiddenError(`${role} login only`);

    const { password: hashedPassword, id } = user as any;

    const isMatched = await this.comparePasswordService.comparePassword(plainPassword, hashedPassword)

    if (!isMatched) this.handleErrorsService.throwBadRequestError("Password invalid")

    const payload = { id }

    const accessToken = await this.generateAccessToken(payload)
    const refreshToken = await this.generateRefreshToken(payload)

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

  private async generateAccessToken(payload: { id: string | undefined }): Promise<string> {

    const accessTokenSecrete = this.config.get<string>('ACCESS_TOKEN_SECRET')
    const accessTokenExpires = this.config.get<string>('ACCESS_TOKEN_EXPIRES')

    const accessToken = this.jwtService.sign(payload, { secret: accessTokenSecrete, expiresIn: accessTokenExpires });

    return accessToken
  }

  private async generateRefreshToken(payload: { id: string | undefined }): Promise<string> {

    const refreshTokenSecrete = this.config.get<string>('REFRESH_TOKEN_SECRET')
    const refreshTokenExpires = this.config.get<string>('REFRESH_TOKEN_EXPIRES')

    const refreshToken = this.jwtService.sign(payload, { secret: refreshTokenSecrete, expiresIn: refreshTokenExpires });

    return refreshToken
  }

  async forgetPassword(email: string) {

    try {
      const user = await this.fetchUserService.fetchUser(email)

      if (!user) this.handleErrorsService.throwBadRequestError('Invalid Email');

      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpires = new Date(Date.now() + Number(this.config.get<number>('OTP_EXPIRES')) * 60 * 1000)

      await this.prisma.user.update({
        where: { id: user?.id },
        data: {
          otp: otp.toString(),
          otpExpires
        }
      })

      //send otp to email

      return {
        message: 'Otp sent successfully',
        data: otp
      }
    }

    catch (error) {
      this.handleErrorsService.handleError(error)
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const user = await this.fetchUserService.fetchUser(email)

      if (!user) {
        this.handleErrorsService.throwBadRequestError('Invalid email');
      }

      if (!user.otp || !user.otpExpires) {
        this.handleErrorsService.throwBadRequestError('Otp not found');
      }

      if (user?.otp !== otp || new Date() > user.otpExpires) {
        this.handleErrorsService.throwBadRequestError('Invalid or expired otp')
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
      const user = await this.fetchUserService.fetchUser(email)

      if (!user) {
        this.handleErrorsService.throwBadRequestError('User not found');
      }

      if (user.otp || user.otpExpires) {
        this.handleErrorsService.throwBadRequestError('Otp not verified');
      }

      const hashedPassword = await argon.hash(newPassword);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })

      return {
        message: 'Password reset successfully',
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

      const decodedToken = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET')
      });

      if (!decodedToken || decodedToken.id !== user?.id) {
        this.handleErrorsService.throwBadRequestError('Refresh token invalid');
      }

      const accessToken = await this.generateAccessToken({ id: user?.id })
      const newRefreshToken = await this.generateRefreshToken({ id: user?.id })

      await this.prisma.user.update({
        where: { id: user?.id },
        data: { refreshToken: newRefreshToken }
      })

      return {
        message: 'Token refreshed successfully',
        data: accessToken
      }
    }

    catch (error) {
      this.handleErrorsService.handleError(error);
    }
  }

  async logout(id: string) {

    try {
      const user = await this.prisma.user.findUnique({
        where: { id }
      })

      if (!user) {
        this.handleErrorsService.throwNotFoundError('User not found');
      }

      else if (!user?.isOnline) {
        this.handleErrorsService.throwForbiddenError('You cannot logout an offline user');
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
}