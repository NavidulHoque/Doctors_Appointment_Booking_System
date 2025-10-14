import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { UserDto } from './dtos';

@Injectable()
export class UserService {

    constructor(
        private prisma: PrismaService
    ) { }

    getUser(user: UserDto) {
        const { fullName, email, phone, gender, birthDate, address } = user
        return {
            data: { fullName, email, phone, gender, birthDate, address },
            message: "User fetched successfully"
        }
    }

    async updateUserActivity(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        })

        if (!user) {
            throw new NotFoundException("User not found")
        }

        else if (!user?.isOnline) {
            throw new ForbiddenException("You cannot update an offline user's last active date")
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

    async updateUser(dto: UserDto, id: string) {
        const { fullName, email, phone, gender, birthDate, address, password } = dto

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: { fullName, email, phone, gender, birthDate, address, password }
        })

        return {
            message: 'User updated successfully',
            data: updatedUser
        }
    }

    async deleteUser(user: UserDto) {

        const { id } = user

        await this.prisma.user.delete({ where: { id } })

        return {
            message: 'User deleted successfully'
        }
    }
}
