import { IsString, IsNumber, Min, MinLength, IsArray, ArrayNotEmpty, IsNotEmpty, Matches, IsEmail } from 'class-validator';

export class CreateDoctorDto {
    @IsNotEmpty({ message: 'Full Name is required' })
    @IsString()
    @MinLength(5, { message: 'Full name must be at least 5 characters long' })
    @Matches(/^[a-zA-Z. ]+$/, {
        message: 'Full name can only contain letters, spaces, and dots',
    })
    readonly fullName: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsString()
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message:
            'Password must contain at least one number and one special character',
    })
    readonly password: string;

    @IsNotEmpty({ message: 'Specialization is required' })
    @IsString()
    readonly specialization: string;

    @IsNotEmpty({ message: 'Education is required' })
    @IsString()
    @MinLength(5, { message: 'Education must be at least 5 characters long' })
    readonly education: string;

    @IsNotEmpty({ message: 'Experience is required' })
    @IsNumber()
    @Min(1, { message: 'Experience must be at least 1 year' })
    readonly experience: number;

    @IsNotEmpty({ message: 'About me is required' })
    @IsString()
    @MinLength(10, { message: 'About me must be at least 10 characters long' })
    readonly aboutMe: string;

    @IsNotEmpty({ message: 'Fees is required' })
    @IsNumber()
    @Min(20, { message: 'Fees must be at least 20' })
    readonly fees: number;

    @IsNotEmpty({ message: 'Available times is required' })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    readonly availableTimes: string[];
}
