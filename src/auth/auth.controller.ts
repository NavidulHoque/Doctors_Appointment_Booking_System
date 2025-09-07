import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgetPasswordDto, LoginDto, RegistrationDto, VerifyOtpDto, ResetPasswordDto, LogoutDto } from './dto';
import { AuthGuard } from './guard';
import { Role } from '@prisma/client';
import { RequestWithTrace } from 'src/common/types';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) { }

    @Post("/register")
    register(@Body() dto: RegistrationDto) {
        return this.authService.register(dto)
    }

    @Post("/patientLogin")
    @HttpCode(200)
    patientLogin(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.login({ ...dto, role: Role.PATIENT }, res)
    }

    @Post("/doctorLogin")
    @HttpCode(200)
    doctorLogin(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.login({ ...dto, role: Role.DOCTOR }, res)
    }

    @Post("/adminLogin")
    @HttpCode(200)
    adminLogin(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.login({ ...dto, role: Role.ADMIN }, res)
    }

    @Post("/forgetPassword")
    @HttpCode(200)
    forgetPassword(
        @Body() dto: ForgetPasswordDto,
        @Req() req: RequestWithTrace
    ) {
        const traceId = req.traceId
        return this.authService.forgetPassword(dto, traceId)
    }

    @Post("/verifyOtp")
    @HttpCode(200)
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto)
    }

    @Post("/resetPassword")
    @HttpCode(200)
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto)
    }

    @Get("/refreshAccessToken")
    refreshAccessToken(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ){
        const refreshToken = req.cookies['refresh_token']
        return this.authService.refreshAccessToken(refreshToken, res)
    }

    @UseGuards(AuthGuard)
    @Post("/logout")
    @HttpCode(200)
    logout(
        @Body() dto: LogoutDto,
        @Res({ passthrough: true }) res: Response
    ){
        return this.authService.logout(dto, res)
    }
}
