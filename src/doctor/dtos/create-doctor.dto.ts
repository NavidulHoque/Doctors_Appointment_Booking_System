import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { IsRequiredEmail, IsRequiredName, IsRequiredNumber, IsRequiredPassword, IsRequiredString } from 'src/common/decorators';

export class CreateDoctorDto {
    @IsRequiredName()
    readonly fullName: string;

    @IsRequiredEmail()
    readonly email: string;

    @IsRequiredPassword()
    readonly password: string;

    @IsRequiredString({
        requiredMessage: 'Specialization is required',
        stringMessage: 'Specialization must be a string',
        minLength: 3,
        minLengthMessage: 'Specialization must be at least 3 characters long',
    })
    readonly specialization: string;

    @IsRequiredString({
        requiredMessage: 'Education is required',
        stringMessage: 'Education must be a string',
        minLength: 5,
        minLengthMessage: 'Education must be at least 5 characters long',
    })
    readonly education: string;

    @IsRequiredNumber({
        requiredMessage: 'Experience is required',
        numberMessage: 'Experience must be a number',
        min: 1,
        minMessage: 'Experience must be at least 1 year',
    })
    readonly experience: number;

    @IsRequiredString({
        requiredMessage: 'About me is required',
        stringMessage: 'About me must be a string',
        minLength: 10,
        minLengthMessage: 'About me must be at least 10 characters long',
    })
    readonly aboutMe: string;

    @IsRequiredNumber({
        requiredMessage: 'Fees is required',
        numberMessage: 'Fees must be a number',
        min: 20,
        minMessage: 'Fees must be at least 20',
    })
    readonly fees: number;

    @IsString({ each: true, message: 'Each available time must be a string' })
    @ArrayNotEmpty({ message: 'Available times cannot be empty' })
    @IsArray({ message: 'Available times must be an array' })
    readonly availableTimes: string[];
}
