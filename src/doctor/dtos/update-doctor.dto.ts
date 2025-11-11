import { Gender } from '@prisma/client';
import {
    IsOptionalString,
    IsOptionalEmail,
    IsOptionalName,
    IsOptionalPassword
} from 'src/common/decorators/string';
import {
    IsOptionalAboutMe,
    IsOptionalEducation,
    IsOptionalExperience,
    IsOptionalFee,
    IsOptionalGender,
    IsOptionalPhone,
    IsOptionalSpecialization
} from '../decorators';
import { IsOptionalBirthDate } from 'src/common/decorators/date';
import { IsOptionalBoolean } from 'src/common/decorators/boolean';

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

    @IsOptionalFee()
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

