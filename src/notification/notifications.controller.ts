import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { User } from 'src/user/decorator';
import { UserDto } from 'src/user/dto';
import { Roles } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ) { }

    @Get("/get-all-notifications")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    getNotifications(
        @User("id") userId: string,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ) {
        return this.notificationService.getAllNotifications(userId, page, limit)
    }
}
