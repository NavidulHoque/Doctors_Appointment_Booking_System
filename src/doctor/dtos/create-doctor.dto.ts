import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { IsRequiredEmail, IsRequiredName, IsRequiredPassword } from 'src/common/decorators/string';
import { IsRequiredAboutMe, IsRequiredEducation, IsRequiredExperience, IsRequiredFees, IsRequiredSpecialization } from '../decorators';

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

    @IsString({ each: true, message: 'Each available time must be a string' })
    @ArrayNotEmpty({ message: 'Available times cannot be empty' })
    @IsArray({ message: 'Available times must be an array' })
    readonly availableTimes: string[];
}
