import { User as PrismaUser } from '@prisma/client';
import { SessionWithUser } from '../types';

class BaseUserDto {
    readonly id: string;
    readonly fullName: string;
    readonly email: string;
    readonly role: string;

    constructor(user: Pick<PrismaUser, 'id' | 'fullName' | 'email' | 'role'>) {
        this.id = user.id;
        this.fullName = user.fullName;
        this.email = user.email;
    }
}

export class SessionResponseDto {
    readonly id: string;
    readonly deviceName: string | null;
    readonly user: BaseUserDto;

    constructor(session: SessionWithUser) {
        this.id = session.id;
        this.deviceName = session.deviceName;
        this.user = new BaseUserDto(session.user);
    }
}
