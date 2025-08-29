import { Body, Controller, Delete, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { UserDto } from './dto';
import { Roles, User } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService
    ) { }

    @Get("/get-user")
    @Roles(Role.Admin, Role.Patient)
    getUser(@User() user: UserDto) {
        return this.userService.getUser(user)
    }

    @Patch("/update-user-activity")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    updateUserActivity(
        @User("id") userId: string
    ) {
        return this.userService.updateUserActivity(userId)
    }

    @Put("/update-user")
    @Roles(Role.Admin, Role.Patient)
    updateUser(
        @Body() dto: UserDto, 
        @User("id") userId: string
    ) {
        return this.userService.updateUser(dto, userId)
    }

    @Delete("")
    @Roles(Role.Admin, Role.Patient)
    deleteUser(@User() user: UserDto) {
        return this.userService.deleteUser(user)
    }
}
