import { Method, Status } from '@prisma/client';
import { AppointmentWithUser, UserWithDoctor } from '../types';
import { PrismaUserSummary } from '../types/prisma-user-summary.type';

export class UserInfoDto {
    readonly id: string;
    readonly fullName: string;
    readonly email: string;
    readonly avatarImage: string;

    constructor(user: PrismaUserSummary) {
        this.id = user.id;
        this.fullName = user.fullName;
        this.email = user.email;
        this.avatarImage = user.avatarImage;
    }
}

export class DoctorInfoDto extends UserInfoDto {
    readonly fees: number;

    constructor(user: UserWithDoctor) {
        super(user);
        this.fees = user.doctor.fees;
    }
}

export class AppointmentResponseDto {
    readonly id: string;
    readonly doctor: DoctorInfoDto;
    readonly patient: UserInfoDto;
    readonly date: Date;
    readonly status: Status;
    readonly cancellationReason: string;
    readonly isPaid: boolean;
    readonly paymentMethod: Method | null;

    constructor(appointment: AppointmentWithUser) {
        this.id = appointment.id;
        this.doctor = new DoctorInfoDto(appointment.doctor);
        this.patient = new UserInfoDto(appointment.patient);
        this.date = appointment.date;
        this.status = appointment.status;
        this.cancellationReason = appointment.cancellationReason;
        this.isPaid = appointment.isPaid;
        this.paymentMethod = appointment.paymentMethod;
    }
}
