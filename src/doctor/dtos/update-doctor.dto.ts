import { IsOptional, IsString, IsEnum, IsDate, MinLength, Matches, IsEmail, IsNumber, Min } from 'class-validator';
import { Gender } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsOptionalBoolean, IsOptionalString } from 'src/common/decorators';

export class UpdateDoctorDto {
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
    @IsString()
    readonly specialization?: string;

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

    @IsOptionalString({
        stringMessage: 'phone must be a string',
        matches: {
            pattern: /^\d{11}$/,
            message: 'Phone number must be exactly 11 digits',
        }
    })
    readonly phone?: string;

    @IsOptional()
    @IsString()
    @IsEnum(Gender, { message: 'Gender must be male, female or other' })
    @Transform(({ value }) => value.toUpperCase())
    readonly gender?: Gender;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Date must be a valid date' })
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

