import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from '@dab/backend/modules/user/user.service';
import { UpdateUserDto } from '@dab/backend/modules/user/dtos/update-user.dto';
import { CurrentUser } from '@dab/backend/common/decorators/current-user.decorator';
import type { User } from '@dab/database';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { MessageResponseDto } from '@dab/backend/common/dtos/response/message-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get('me')
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiOkResponse({ description: 'Current user profile returned' })
	getMe(@CurrentUser() user: User) {
		return this.userService.me(user.id);
	}

	@Patch('me')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Update current user profile' })
	@ApiOkResponse({ description: 'Profile updated successfully' })
	updateMe(@Body() dto: UpdateUserDto, @CurrentUser() user: User) {
		return this.userService.updateMe(user.id, dto);
	}

	@Patch('activity/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Update user last active timestamp' })
	@ApiParam({ name: 'id', description: 'User UUID' })
	@ApiOkResponse({ description: 'Activity timestamp updated' })
	@ApiNotFoundResponse({ description: 'User not found' })
	updateActivity(@Param('id') id: string) {
		return this.userService.updateUserActivity(id);
	}

	@Delete('me')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete current user account' })
	@ApiOkResponse({ description: 'Account deleted successfully' })
	@ApiInternalServerErrorResponse({ description: 'Failed to delete account' })
	deleteMe(@CurrentUser() user: User) {
		return this.userService.deleteAccount(user.id);
	}

	@Patch('change-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Change user password' })
	@ApiBody({ type: ChangePasswordDto })
	@ApiOkResponse({
		description: 'Password changed successfully',
		type: MessageResponseDto
	})
	@ApiUnauthorizedResponse({ description: 'Current password is incorrect' })
	@ApiInternalServerErrorResponse({ description: 'Failed to change password' })
	changePassword(
		@CurrentUser() user: User,
		@Body() dto: ChangePasswordDto,
	) {
		return this.userService.changePassword(user.id, dto);
	}
}
