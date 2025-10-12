import { Appointment as PrismaAppointment } from '@prisma/client';
import { UserWithDoctor } from './user-with-doctor.type';
import { PrismaUserSummary } from './prisma-user-summary.type';

export type AppointmentWithUser = PrismaAppointment & {
    doctor: UserWithDoctor;
    patient: PrismaUserSummary;
}