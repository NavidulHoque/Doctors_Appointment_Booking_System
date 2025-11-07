import { Gender } from '@prisma/client';
import {
    IsOptionalBoolean,
    IsOptionalString,
    IsOptionalEmail,
    IsDateField,
    IsOptionalName,
    IsOptionalBirthDate,
    IsOptionalPassword
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

    @IsOptionalPassword()
    readonly currentPassword?: string;

    @IsOptionalPassword()
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

