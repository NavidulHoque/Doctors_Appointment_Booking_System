import { Controller, Get, Query } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NotificationService } from '@backend/modules/notification/notification.service';
import { GetNotificationsDto } from '@backend/modules/notification/dtos/query-notification.dto';
import { CurrentUser } from '@backend/common/decorators/current-user.decorator';
import type { User } from '@dab/database';

@ApiTags('notifications')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	@ApiOperation({ summary: 'Get paginated notifications for current user' })
	@ApiOkResponse({ description: 'Paginated list of notifications returned' })
	getNotifications(@CurrentUser() user: User, @Query() query: GetNotificationsDto) {
		return this.notificationService.getAllNotifications(user.id, query);
	}
}
