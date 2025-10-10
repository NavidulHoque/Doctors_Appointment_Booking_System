import { Prisma } from '@prisma/client';

export const sessionSelect: Prisma.SessionSelect = {
    id: true,
    deviceName: true,
    user: {
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    }
  }