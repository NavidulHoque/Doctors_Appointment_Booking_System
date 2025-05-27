import { Body, Controller, Delete, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard';
import { User } from './decorator';
import { UserService } from './user.service';
import { UserDto } from './dto';
import { CheckRoleService } from 'src/common/checkRole.service';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {

    constructor(
        private userService: UserService,
        private checkRoleService: CheckRoleService
    ) { }

    @Get("/get-user")
    getUser(@User() user: UserDto) {
        this.checkRoleService.checkIsAdminOrPatient(user.role)
        return this.userService.getUser(user)
    }

    @Put("/update-user")
    updateUser(
        @Body() dto: UserDto, 
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatient(user.role)
        return this.userService.updateUser(dto, user.id)
    }

    @Delete("")
    deleteUser(@User() user: UserDto) {
        this.checkRoleService.checkIsAdminOrPatient(user.role)
        return this.userService.deleteUser(user)
    }
}
