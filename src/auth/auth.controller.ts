import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgetPasswordDto, LoginDto, RefreshAccessTokenDto, RegistrationDto, VerifyOtpDto, ResetPasswordDto, LogoutDto } from './dto';
import { AuthGuard, RolesGuard } from './guard';
import { Roles } from './decorators';
import { Role } from './enum';

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
    patientLogin(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    }

    @Post("/doctorLogin")
    @HttpCode(200)
    doctorLogin(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    }

    @Post("/adminLogin")
    @HttpCode(200)
    adminLogin(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    }

    @Post("/forgetPassword")
    @HttpCode(200)
    forgetPassword(@Body() dto: ForgetPasswordDto) {
        return this.authService.forgetPassword(dto)
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

    @Post("/refreshAccessToken")
    @HttpCode(200)
    refreshAccessToken(
        @Body() dto: RefreshAccessTokenDto
    ){
        return this.authService.refreshAccessToken(dto)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post("/logout")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    @HttpCode(200)
    logout(
        @Body() dto: LogoutDto
    ){
        return this.authService.logout(dto)
    }
}
