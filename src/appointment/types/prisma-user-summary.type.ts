import { User as PrismaUser } from '@prisma/client';

export type PrismaUserSummary = Pick<PrismaUser, 'id' | 'fullName' | 'email' | 'avatarImage'>;
