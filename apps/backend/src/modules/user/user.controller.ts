import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from '@backend/modules/user/user.service';
import { UpdateUserDto } from '@backend/modules/user/dtos/update-user.dto';
import { CurrentUser } from '@backend/common/decorators/current-user.decorator';
import type { User } from '@dab/database';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('me')
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiOkResponse({ description: 'Current user profile returned' })
	getMe(@CurrentUser() user: User) {
		return this.userService.getUser(user);
	}

	@Patch('me')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Update current user profile' })
	@ApiOkResponse({ description: 'Profile updated successfully' })
	updateMe(@Body() dto: UpdateUserDto, @CurrentUser() user: User) {
		return this.userService.updateUser(dto, user.id);
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
	deleteMe(@CurrentUser() user: User) {
		return this.userService.deleteUser(user);
	}
}
