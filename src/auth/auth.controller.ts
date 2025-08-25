import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegistrationDto } from './dto';
import { AuthGuard } from './guard';
import { User } from 'src/user/decorator';
import { UserDto } from 'src/user/dto';
import { CheckRoleService } from 'src/common/checkRole.service';
import { OtherAuthDto } from './dto/otherAuth.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly checkRoleService: CheckRoleService
    ) { }

    @Post("/register")
    register(@Body() dto: RegistrationDto) {
        return this.authService.register(dto)
    }

    @Post("/patientLogin")
    patientLogin(@Body() dto: LoginDto) {
        return this.authService.patientLogin(dto)
    }

    @Post("/doctorLogin")
    doctorLogin(@Body() dto: LoginDto) {
        return this.authService.doctorLogin(dto)
    }

    @Post("/adminLogin")
    adminLogin(@Body() dto: LoginDto) {
        return this.authService.adminLogin(dto)
    }

    @Post("/forgetPassword")
    forgetPassword(@Body() dto: OtherAuthDto) {
        return this.authService.forgetPassword(dto.email!)
    }

    @Post("/verifyOtp")
    verifyOtp(@Body() dto: OtherAuthDto) {
        return this.authService.verifyOtp(dto.email!, dto.otp!)
    }

    @Post("/resetPassword")
    resetPassword(@Body() dto: OtherAuthDto) {
        return this.authService.resetPassword(dto.email!, dto.newPassword!)
    }

    @Post("/refreshAccessToken")
    refreshAccessToken(
        @Body() dto: OtherAuthDto
    ){
        return this.authService.refreshAccessToken(dto.refreshToken!)
    }

    @UseGuards(AuthGuard)
    @Post("/logout")
    async logout(
        @User() user: UserDto
    ){
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.authService.logout(user.id)
    }
}
