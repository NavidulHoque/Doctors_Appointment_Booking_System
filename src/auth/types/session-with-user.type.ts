import { User as PrismaUser, Session as PrismaSession } from '@prisma/client';

export type SessionWithUser = PrismaSession & { user: PrismaUser };