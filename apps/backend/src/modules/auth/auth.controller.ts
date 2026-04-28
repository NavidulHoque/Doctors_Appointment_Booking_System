import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
	ApiConflictResponse,
	ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from '@backend/modules/auth/auth.service';
import { RegisterDto } from '@backend/modules/auth/dtos/register.dto';
import { LoginDto } from '@backend/modules/auth/dtos/login.dto';
import { ForgotPasswordDto } from '@backend/modules/auth/dtos/forgot-password.dto';
import { VerifyOtpDto } from '@backend/modules/auth/dtos/verify-otp.dto';
import { ResetPasswordDto } from '@backend/modules/auth/dtos/reset-password.dto';
import { RefreshTokenDto } from '@backend/modules/auth/dtos/refresh-token.dto';
import { Public } from '@backend/common/decorators/public.decorator';
import { CurrentUser } from '@backend/common/decorators/current-user.decorator';
import type { User } from '@dab/database';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('register')
	@ApiOperation({ summary: 'Register a new patient account' })
	@ApiCreatedResponse({ description: 'Patient registered, OTP sent to email' })
	@ApiConflictResponse({ description: 'Email already in use' })
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Public()
	@Post('patient-login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Patient login' })
	@ApiOkResponse({ description: 'Access and refresh tokens returned' })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials or email not verified' })
	patientLogin(@Body() dto: LoginDto) {
		return this.authService.patientLogin(dto);
	}

	@Public()
	@Post('doctor-login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Doctor login' })
	@ApiOkResponse({ description: 'Access and refresh tokens returned' })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials' })
	doctorLogin(@Body() dto: LoginDto) {
		return this.authService.doctorLogin(dto);
	}

	@Public()
	@Post('admin-login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Admin login' })
	@ApiOkResponse({ description: 'Access and refresh tokens returned' })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials' })
	adminLogin(@Body() dto: LoginDto) {
		return this.authService.adminLogin(dto);
	}

	@Public()
	@Post('forgot-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Send password reset OTP to email' })
	@ApiOkResponse({ description: 'OTP sent if account exists' })
	forgotPassword(@Body() dto: ForgotPasswordDto) {
		return this.authService.forgotPassword(dto.email);
	}

	@Public()
	@Post('verify-otp')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Verify OTP for signup or password recovery' })
	@ApiOkResponse({ description: 'OTP verified successfully' })
	@ApiBadRequestResponse({ description: 'Invalid or expired OTP' })
	verifyOtp(@Body() dto: VerifyOtpDto) {
		return this.authService.verifyOtp(dto.email, dto.token, dto.type);
	}

	@Public()
	@Post('reset-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Reset password after OTP verification' })
	@ApiOkResponse({ description: 'Password updated successfully' })
	@ApiBadRequestResponse({ description: 'OTP not verified or token expired' })
	resetPassword(@Body() dto: ResetPasswordDto) {
		return this.authService.resetPassword(dto);
	}

	@Public()
	@Post('refresh-token')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Refresh access token using refresh token' })
	@ApiOkResponse({ description: 'New access token returned' })
	@ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
	refreshToken(@Body() dto: RefreshTokenDto) {
		return this.authService.refreshToken(dto);
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Logout and invalidate current session' })
	@ApiOkResponse({ description: 'Logged out successfully' })
	@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
	logout(@CurrentUser() user: User, @Body() dto: Partial<RefreshTokenDto>) {
		return this.authService.logout(user.id, dto.refreshToken);
	}
}
