import { IsString, IsNumber, Min, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';
import { IsRequiredEmail, IsRequiredString } from 'src/common/decorators';

export class CreateDoctorDto {
    @IsRequiredString({
        requiredMessage: 'Name is required',
        stringMessage: 'Name must be a string',
        minLength: 5,
        minLengthMessage: 'Name must be at least 5 characters long',
        matches: {
            pattern: /^[a-zA-Z. ]+$/,
            message: 'Name can only contain letters, spaces, and dots',
        },
    })
    readonly fullName: string;

    @IsRequiredEmail()
    readonly email: string;

    @IsRequiredString({
        requiredMessage: 'Password is required',
        stringMessage: 'Password must be a string',
        minLength: 8,
        minLengthMessage: 'Password must be at least 8 characters long',
        matches: {
            pattern: /^(?=.*\d)(?=.*[\W_]).{8,}$/,
            message: 'Password must contain at least one number and one special character',
        },
    })
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

    @IsNotEmpty({ message: 'Experience is required' })
    @IsNumber()
    @Min(1, { message: 'Experience must be at least 1 year' })
    readonly experience: number;

    @IsRequiredString({
        requiredMessage: 'About me is required',
        stringMessage: 'About me must be a string',
        minLength: 10,
        minLengthMessage: 'About me must be at least 10 characters long',
    })
    readonly aboutMe: string;

    @IsNotEmpty({ message: 'Fees is required' })
    @IsNumber()
    @Min(20, { message: 'Fees must be at least 20' })
    readonly fees: number;

    @IsArray({ message: 'Available times must be an array' })
    @ArrayNotEmpty({ message: 'Available times cannot be empty' })
    @IsString({ each: true, message: 'Each available time must be a string' })
    readonly availableTimes: string[];
}
