import { IsOptional, IsString, IsEnum, IsDate, IsBoolean, MinLength, Matches, IsEmail, IsNumber, Min } from 'class-validator';
import { Gender } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { BaseDoctorDto } from './baseDoctor.dto';

export class UpdateDoctorDto extends BaseDoctorDto {
    @IsOptional()
    @IsString()
    @MinLength(5, { message: 'Full name must be at least 5 characters long' })
    @Matches(/^[a-zA-Z. ]+$/, {
        message: 'Full name can only contain letters, spaces, and dots',
    })
    readonly fullName?: string;

    @IsOptional()
    @IsString()
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email?: string;

    @IsOptional()
    @IsString()
    @MinLength(5, { message: 'Education must be at least 5 characters long' })
    readonly education?: string;

    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'Experience must be at least 1 year' })
    readonly experience?: number;

    @IsOptional()
    @IsString()
    @MinLength(10, { message: 'About me must be at least 10 characters long' })
    readonly aboutMe?: string;

    @IsOptional()
    @IsNumber()
    @Min(20, { message: 'Fees must be at least 20' })
    readonly fees?: number;

    @IsOptional()
    @IsString()
    readonly phone?: string;

    @IsOptional()
    @IsString()
    @IsEnum(Gender, { message: 'Gender must be male, female or other' })
    @Transform(({ value }) => value.toUpperCase())
    readonly gender?: Gender;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Date must be a valid date' })
    readonly birthDate?: string;

    @IsOptional()
    @IsString()
    readonly address?: string;

    @IsOptional()
    @IsString()
    readonly currentPassword?: string;

    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message:
            'Password must contain at least one number and one special character',
    })
    readonly newPassword?: string;

    @IsOptional()
    @IsBoolean()
    readonly isActive?: boolean;

    @IsOptional()
    @IsString()
    readonly addAvailableTime?: string;

    @IsOptional()
    @IsString()
    readonly removeAvailableTime?: string;
}

