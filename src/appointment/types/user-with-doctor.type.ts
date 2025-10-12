import { Doctor as PrismaDoctor } from '@prisma/client';
import { PrismaUserSummary } from './prisma-user-summary.type';

export type UserWithDoctor = PrismaUserSummary & { doctor: Pick<PrismaDoctor, 'fees'> }