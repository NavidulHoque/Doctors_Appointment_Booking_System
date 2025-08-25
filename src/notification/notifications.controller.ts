import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/guard';
import { CheckRoleService } from 'src/common/checkRole.service';
import { User } from 'src/user/decorator';
import { UserDto } from 'src/user/dto';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly checkRoleService: CheckRoleService
    ) { }

    @Get("/get-all-notifications")
    getNotifications(
        @User() user: UserDto,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.notificationService.getAllNotifications(user.id, page, limit)
    }
}
