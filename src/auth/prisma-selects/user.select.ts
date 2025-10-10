import { Prisma } from '@prisma/client';

export const userSelect: Prisma.UserSelect = {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    role: true,
    password: true,
    otp: true,
    otpExpires: true,
    isOtpVerified: true
}