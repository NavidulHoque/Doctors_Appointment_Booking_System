export class AppointmentCountResponseDto {
    readonly totalAppointments: number;
    readonly totalUniquePatientsCount: number;
    readonly totalUniqueDoctorsCount: number;
    readonly totalPendingAppointments: number;
    readonly totalConfirmedAppointments: number;
    readonly totalRunningAppointments: number;
    readonly totalCompletedAppointments: number;
    readonly totalCancelledAppointments: number;
    readonly totalPaidAppointments: number;
    readonly totalUnPaidAppointments: number;
    readonly totalCashPaidAppointments: number;
    readonly totalOnlinePaidAppointments: number;

    constructor(data: {
        totalAppointments: number;
        totalUniquePatientsCount: number;
        totalUniqueDoctorsCount: number;
        totalPendingAppointments: number;
        totalConfirmedAppointments: number;
        totalRunningAppointments: number;
        totalCompletedAppointments: number;
        totalCancelledAppointments: number;
        totalPaidAppointments: number;
        totalUnPaidAppointments: number;
        totalCashPaidAppointments: number;
        totalOnlinePaidAppointments: number;
    }) {
        this.totalAppointments = data.totalAppointments;
        this.totalUniquePatientsCount = data.totalUniquePatientsCount;
        this.totalUniqueDoctorsCount = data.totalUniqueDoctorsCount;
        this.totalPendingAppointments = data.totalPendingAppointments;
        this.totalConfirmedAppointments = data.totalConfirmedAppointments;
        this.totalRunningAppointments = data.totalRunningAppointments;
        this.totalCompletedAppointments = data.totalCompletedAppointments;
        this.totalCancelledAppointments = data.totalCancelledAppointments;
        this.totalPaidAppointments = data.totalPaidAppointments;
        this.totalUnPaidAppointments = data.totalUnPaidAppointments;
        this.totalCashPaidAppointments = data.totalCashPaidAppointments;
        this.totalOnlinePaidAppointments = data.totalOnlinePaidAppointments;
    }
}
