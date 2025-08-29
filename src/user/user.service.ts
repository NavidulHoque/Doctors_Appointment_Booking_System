import { Injectable } from '@nestjs/common';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class UserService {

    constructor(
        private prisma: PrismaService,
        private handleErrorsService: HandleErrorsService
    ) { }

    getUser(user: UserDto) {
        const { fullName, email, phone, gender, birthDate, address } = user
        return {
            data: { fullName, email, phone, gender, birthDate, address },
            message: "User fetched successfully"
        }
    }

    async updateUserActivity(id: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id }
            })

            if (!user) {
                this.handleErrorsService.throwNotFoundError("User not found")
            }

            else if (!user?.isOnline) {
                this.handleErrorsService.throwForbiddenError("You cannot update an offline user's last active date")
            }

            await this.prisma.user.update({
                where: { id },
                data: {
                    isOnline: true, 
                    lastActiveAt: new Date() 
                }
            })

            return {
                message: 'User activity updated successfully'
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }

    async updateUser(dto: UserDto, id: string) {
        const { fullName, email, phone, gender, birthDate, address, password } = dto

        try {
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: { fullName, email, phone, gender, birthDate, address, password }
            })

            return {
                message: 'User updated successfully',
                data: updatedUser
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }

    async deleteUser(user: UserDto) {

        const { id } = user

        try {
            await this.prisma.user.delete({ where: { id } })

            return {
                message: 'User deleted successfully'
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }
}
