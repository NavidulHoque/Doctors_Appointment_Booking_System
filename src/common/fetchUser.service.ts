import { Injectable } from "@nestjs/common";
import { AuthUser } from "src/auth/interface";
import { PrismaService } from "src/prisma/prisma.service";
import { Role, UserDto } from "src/user/dto";


@Injectable()
export class FetchUserService {
    constructor(private prisma: PrismaService) { }

    async fetchUser(email?: string): Promise<any | null> {

        const user = await this.prisma.user.findUnique({ 
            where: { email },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                password: true,
                otp: true,
                otpExpires: true
            }
        });

        if (!user) return null;

        return user;
    }
}