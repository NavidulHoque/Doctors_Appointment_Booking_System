import { User as PrismaUser, Session as PrismaSession } from '@prisma/client';

export type SessionWithUser = (
    Pick<PrismaSession, 'id' | 'deviceName'> &
    { user: Pick<PrismaUser, 'id' | 'fullName' | 'email' | 'role'> }
)