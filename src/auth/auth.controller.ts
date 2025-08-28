import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegistrationDto } from './dto';
import { AuthGuard, RolesGuard } from './guard';
import { OtherAuthDto } from './dto/otherAuth.dto';
import { Roles, User } from './decorators';
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
        return this.authService.patientLogin(dto)
    }

    @Post("/doctorLogin")
    @HttpCode(200)
    doctorLogin(@Body() dto: LoginDto) {
        return this.authService.doctorLogin(dto)
    }

    @Post("/adminLogin")
    @HttpCode(200)
    adminLogin(@Body() dto: LoginDto) {
        return this.authService.adminLogin(dto)
    }

    @Post("/forgetPassword")
    @HttpCode(200)
    forgetPassword(@Body() dto: OtherAuthDto) {
        return this.authService.forgetPassword(dto.email!)
    }

    @Post("/verifyOtp")
    @HttpCode(200)
    verifyOtp(@Body() dto: OtherAuthDto) {
        return this.authService.verifyOtp(dto.email!, dto.otp!)
    }

    @Post("/resetPassword")
    @HttpCode(200)
    resetPassword(@Body() dto: OtherAuthDto) {
        return this.authService.resetPassword(dto.email!, dto.newPassword!)
    }

    @Post("/refreshAccessToken")
    @HttpCode(200)
    refreshAccessToken(
        @Body() dto: OtherAuthDto
    ){
        return this.authService.refreshAccessToken(dto.refreshToken!)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post("/logout")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    @HttpCode(200)
    logout(
        @User("id") userId: string
    ){
        return this.authService.logout(userId)
    }
}
