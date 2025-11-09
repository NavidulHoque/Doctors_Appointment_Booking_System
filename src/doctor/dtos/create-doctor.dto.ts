import { IsRequiredEmail, IsRequiredName, IsRequiredPassword } from 'src/common/decorators/string';
import {
    IsRequiredAboutMe,
    IsRequiredAvailableTimes,
    IsRequiredEducation,
    IsRequiredExperience,
    IsRequiredFees,
    IsRequiredSpecialization
} from '../decorators';

export class CreateDoctorDto {
    @IsRequiredName()
    readonly fullName: string;

    @IsRequiredEmail()
    readonly email: string;

    @IsRequiredPassword()
    readonly password: string;

    @IsRequiredSpecialization()
    readonly specialization: string;

    @IsRequiredEducation()
    readonly education: string;

    @IsRequiredExperience()
    readonly experience: number;

    @IsRequiredAboutMe()
    readonly aboutMe: string;

    @IsRequiredFees()
    readonly fees: number;

    @IsRequiredAvailableTimes()
    readonly availableTimes: string[];
}
