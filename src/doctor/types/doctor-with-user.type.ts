import { User as PrismaUser, Doctor as PrismaDoctor } from '@prisma/client';

export type DoctorWithUser = PrismaUser & { doctor: PrismaDoctor }