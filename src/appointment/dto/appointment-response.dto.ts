import { Status } from '@prisma/client';

export class UserInfoDto {
    readonly id: string;
    readonly fullName: string;
    readonly email: string;
    readonly avatarImage: string;
}

export class DoctorInfoDto extends UserInfoDto {
    readonly fees: number;
}

export class AppointmentResponseDto {
    readonly id: string;
    readonly doctor: DoctorInfoDto;
    readonly patient: UserInfoDto;
    readonly date: Date;
    readonly status: Status;
    readonly cancellationReason: string;
    readonly isPaid: boolean;
    readonly paymentMethod: string;

    constructor(appointment: Record<string, any>) {
        this.id = appointment.id;
        this.doctor = {
            id: appointment.doctor.id,
            fullName: appointment.doctor.fullName,
            email: appointment.doctor.email,
            avatarImage: appointment.doctor.avatarImage,
            fees: appointment.doctor.doctor.fees
        };
        this.patient = {
            id: appointment.patient.id,
            fullName: appointment.patient.fullName,
            email: appointment.patient.email,
            avatarImage: appointment.patient.avatarImage
        };
        this.date = appointment.date;
        this.status = appointment.status;
        this.cancellationReason = appointment.cancellationReason;
        this.isPaid = appointment.isPaid;
        this.paymentMethod = appointment.paymentMethod;
    }
}