import { IsString, IsNumber, Min, MinLength, IsArray, ArrayNotEmpty, IsNotEmpty, Matches, IsEmail } from 'class-validator';

export class CreateDoctorDto {
    @IsString()
    @IsNotEmpty({ message: 'Full Name is required' })
    @MinLength(5, { message: 'Full name must be at least 5 characters long' })
    @Matches(/^[a-zA-Z. ]+$/, {
        message: 'Full name can only contain letters, spaces, and dots',
    })
    readonly fullName: string;

    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message:
            'Password must contain at least one number and one special character',
    })
    readonly password: string;

    @IsString()
    @IsNotEmpty({ message: 'Specialization is required' })
    readonly specialization: string;

    @IsString()
    @IsNotEmpty({ message: 'Education is required' })
    @MinLength(5, { message: 'Education must be at least 5 characters long' })
    readonly education: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Experience is required' })
    @Min(1, { message: 'Experience must be at least 1 year' })
    readonly experience: number;

    @IsString()
    @IsNotEmpty({ message: 'About me is required' })
    @MinLength(10, { message: 'About me must be at least 10 characters long' })
    readonly aboutMe: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Fees is required' })
    @Min(20, { message: 'Fees must be at least 20' })
    readonly fees: number;

    @IsArray()
    @IsNotEmpty({ message: 'Available times is required' })
    @ArrayNotEmpty()
    @IsString({ each: true })
    readonly availableTimes: string[];
}
