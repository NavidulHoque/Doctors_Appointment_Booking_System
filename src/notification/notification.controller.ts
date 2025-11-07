import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard, CsrfGuard, RolesGuard } from 'src/auth/guards';
import { Role } from '@prisma/client';
import { Cache } from 'src/common/decorators/cache';
import { CacheKeyHelper } from './helpers';
import { Roles, User } from 'src/auth/decorators';

@UseGuards(CsrfGuard, AuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ) { }

    @Get("/get-all-notifications")
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @Cache({
        enabled: true,
        ttl: 60,
        key: CacheKeyHelper.generateNotificationsKey
    })
    getNotifications(
        @User("id") userId: string,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ) {
        return this.notificationService.getAllNotifications(userId, page, limit)
    }
}
