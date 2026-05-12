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
	ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { AuthService } from '@dab/backend/modules/auth/auth.service';
import { Public } from '@dab/backend/common/decorators/public.decorator';
import { CurrentUser } from '@dab/backend/common/decorators/current-user.decorator';
import type { AuthSession, MessageOutput } from '@dab/validation';
import { User } from '@dab/database';
import { RegisterDto } from '@dab/backend/modules/auth/dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ResendConfirmationEmailDto } from './dtos/resend-confirmation-email.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { GetOAuthUrlDto } from './dtos/get-oauth-url.dto';
import { ExchangeOAuthSessionDto } from './dtos/exchange-oauth-session.dto';
import { LogoutDto } from './dtos/logout.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('register')
	@ApiOperation({ summary: 'Register a new account' })
	@ApiCreatedResponse({ description: 'Verification email sent' })
	@ApiConflictResponse({ description: 'Email already in use' })
	@ApiBadRequestResponse({ description: 'Weak password or invalid email' })
	@ApiTooManyRequestsResponse({ description: 'Too many requests' })
	register(@Body() dto: RegisterDto): Promise<MessageOutput> {
		return this.authService.register(dto);
	}

	@Public()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login to account' })
	@ApiOkResponse({ description: 'Logged in successfully' })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials or email not verified' })
	login(@Body() dto: LoginDto): Promise<AuthSession> {
		return this.authService.login(dto);
	}

	@Public()
	@Post('forgot-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Send password reset link to email' })
	@ApiOkResponse({ description: 'Password reset email sent if account exists' })
	@ApiTooManyRequestsResponse({ description: 'Too many requests' })
	forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageOutput> {
		return this.authService.forgotPassword(dto);
	}

	@Public()
	@Post('resend-confirmation')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Resend verification email' })
	@ApiOkResponse({ description: 'Verification email sent' })
	@ApiTooManyRequestsResponse({ description: 'Too many requests' })
	resendConfirmation(@Body() dto: ResendConfirmationEmailDto): Promise<MessageOutput> {
		return this.authService.resendConfirmation(dto);
	}

	@Public()
	@Post('reset-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Reset password with new password' })
	@ApiOkResponse({ description: 'Password updated successfully' })
	@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
	resetPassword(@CurrentUser() user: User, @Body() dto: ResetPasswordDto): Promise<MessageOutput> {
		return this.authService.resetPassword(user.id, dto);
	}

	@Public()
	@Post('refresh-token')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Refresh access token using refresh token' })
	@ApiOkResponse({ description: 'New access token returned' })
	@ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
	refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthSession> {
		return this.authService.refreshToken(dto);
	}

	@Public()
	@Post('oauth-url')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Get OAuth authorization URL' })
	@ApiOkResponse({ description: 'OAuth URL returned' })
	getOAuthUrl(@Body() dto: GetOAuthUrlDto): { url: string } {
		return this.authService.getOAuthUrl(dto);
	}

	@Public()
	@Post('exchange-oauth-session')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Exchange OAuth session for auth session' })
	@ApiOkResponse({ description: 'Auth session returned' })
	@ApiUnauthorizedResponse({ description: 'Invalid or expired OAuth session' })
	exchangeOAuthSession(@Body() dto: ExchangeOAuthSessionDto): Promise<AuthSession> {
		return this.authService.exchangeOAuthSession(dto);
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Logout and invalidate session' })
	@ApiOkResponse({ description: 'Logged out successfully' })
	@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
	logout(@Body() dto: LogoutDto): Promise<MessageOutput> {
		return this.authService.logout(dto.token);
	}
}
