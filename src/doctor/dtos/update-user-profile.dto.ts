import { Gender } from "@prisma/client";

export class UpdateUserProfileDto {
    readonly fullName?: string;
    readonly email?: string;
    readonly phone?: string;
    readonly gender?: Gender;
    readonly birthDate?: Date;
    readonly address?: string;
    readonly currentPassword?: string;
    readonly newPassword?: string;
}