import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { sessionSelect, userSelect } from "../prisma-selects";

@Injectable()
export class SessionUserHelper {
    constructor(private readonly prisma: PrismaService) { }

    async findSessionById(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            select: sessionSelect,
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        return session;
    }

    async deleteSession(sessionId: string) {
        await this.prisma.session.delete({
            where: { id: sessionId }
        })
    }

    async fetchUserByEmail(email: string, errorMessage: string) {

        const user = await this.prisma.user.findUnique({
            where: { email },
            select: userSelect
        });

        if (!user) {
            throw new BadRequestException(errorMessage);
        }

        return user;
    }
}
