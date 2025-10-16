import { IsOptional, IsDate } from 'class-validator';
import { Gender } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsOptionalBoolean, IsOptionalEnum, IsOptionalNumber, IsOptionalString, IsOptionalEmail } from 'src/common/decorators';

export class UpdateDoctorDto {
    @IsOptionalString({
        stringMessage: 'Full name must be a string',
        minLength: 5,
        minLengthMessage: 'Full name must be at least 5 characters long',
        matches: {
            pattern: /^[a-zA-Z. ]+$/,
            message: 'Full name can only contain letters, spaces, and dots',
        }
    })
    readonly fullName?: string;

    @IsOptionalEmail()
    readonly email?: string;

    @IsOptionalString({
        stringMessage: 'Education must be a string',
        minLength: 5,
        minLengthMessage: 'Education must be at least 5 characters long',
    })
    readonly education?: string;

    @IsOptionalString({
        stringMessage: 'Specialization must be a string',
        minLength: 3,
        minLengthMessage: 'Specialization must be at least 3 characters long',
    })
    readonly specialization?: string;

    @IsOptionalNumber({
        numberMessage: 'Experience must be a number',
        min: 1,
        minMessage: 'Experience must be at least 1 year',
    })
    readonly experience?: number;

    @IsOptionalString({
        stringMessage: 'About me must be a string',
        minLength: 10,
        minLengthMessage: 'About me must be at least 10 characters long',
    })
    readonly aboutMe?: string;

    @IsOptionalNumber({
        numberMessage: 'Fees must be a number',
        min: 20,
        minMessage: 'Fees must be at least 20',
    })
    readonly fees?: number;

    @IsOptionalString({
        stringMessage: 'phone must be a string',
        matches: {
            pattern: /^\d{11}$/,
            message: 'Phone number must be exactly 11 digits',
        }
    })
    readonly phone?: string;

    @IsOptionalEnum({
        enumType: Gender,
        message: 'Gender must be male, female or other',
        isUppercase: true
    })
    readonly gender?: Gender;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Date must be a valid date' })
    readonly birthDate?: Date;

    @IsOptionalString({
        stringMessage: 'address must be a string',
    })
    readonly address?: string;

    @IsOptionalString({
        stringMessage: 'currentPassword must be a string',
        minLength: 8,
        minLengthMessage: 'current password must be at least 8 characters long',
    })
    readonly currentPassword?: string;

    @IsOptionalString({
        stringMessage: 'new password must be a string',
        minLength: 8,
        minLengthMessage: 'Password must be at least 8 characters long',
        matches: {
            pattern: /^(?=.*\d)(?=.*[\W_]).{8,}$/,
            message: 'Password must contain at least one number and one special character',
        }
    })
    readonly newPassword?: string;

    @IsOptionalBoolean({
        booleanMessage: 'isActive must be a boolean',
    })
    readonly isActive?: boolean;

    @IsOptionalString({
        stringMessage: 'addAvailableTime must be a string',
    })
    readonly addAvailableTime?: string;

    @IsOptionalString({
        stringMessage: 'removeAvailableTime must be a string',
    })
    readonly removeAvailableTime?: string;
}

