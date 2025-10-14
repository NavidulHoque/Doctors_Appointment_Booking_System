import { Body, Controller, Delete, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos';
import { AuthGuard, CsrfGuard, RolesGuard  } from 'src/auth/guards';
import { Role } from '@prisma/client';
import { Roles, User } from 'src/auth/decorators';

@UseGuards(CsrfGuard, AuthGuard, RolesGuard)
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    @Get("/get-user")
    @Roles(Role.ADMIN, Role.PATIENT)
    getUser(@User() user: UserDto) {
        return this.userService.getUser(user)
    }

    @Patch("/update-user-activity")
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    updateUserActivity(
        @User("id") userId: string
    ) {
        return this.userService.updateUserActivity(userId)
    }

    @Put("/update-user")
    @Roles(Role.ADMIN, Role.PATIENT)
    updateUser(
        @Body() dto: UserDto, 
        @User("id") userId: string
    ) {
        return this.userService.updateUser(dto, userId)
    }

    @Delete("")
    @Roles(Role.ADMIN, Role.PATIENT)
    deleteUser(@User() user: UserDto) {
        return this.userService.deleteUser(user)
    }
}
