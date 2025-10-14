export class UpdateDoctorProfileDto {
    readonly specialization?: string;
    readonly education?: string;
    readonly experience?: number;
    readonly aboutMe?: string;
    readonly fees?: number;
    readonly isActive?: boolean;
    readonly addAvailableTime?: string;
    readonly removeAvailableTime?: string;
}