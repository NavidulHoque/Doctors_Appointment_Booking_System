import { Gender } from '@prisma/client';
import {
    IsOptionalBoolean,
    IsOptionalString,
    IsOptionalEmail,
    IsDateField,
    IsOptionalName,
    IsOptionalBirthDate
} from 'src/common/decorators';
import {
    IsOptionalAboutMe,
    IsOptionalEducation,
    IsOptionalExperience,
    IsOptionalFees,
    IsOptionalGender,
    IsOptionalPhone,
    IsOptionalSpecialization
} from '../decorators';

export class UpdateDoctorDto {
    @IsOptionalName()
    readonly fullName?: string;

    @IsOptionalEmail()
    readonly email?: string;

    @IsOptionalEducation()
    readonly education?: string;

    @IsOptionalSpecialization()
    readonly specialization?: string;

    @IsOptionalExperience()
    readonly experience?: number;

    @IsOptionalAboutMe()
    readonly aboutMe?: string;

    @IsOptionalFees()
    readonly fees?: number;

    @IsOptionalPhone()
    readonly phone?: string;

    @IsOptionalGender()
    readonly gender?: Gender;

    @IsOptionalBirthDate()
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

