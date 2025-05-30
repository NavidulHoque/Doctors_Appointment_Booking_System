import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsDate,
    MinLength,
    Matches,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, Role } from '@prisma/client';

export class UserDto {

    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @MinLength(5, { message: 'Full name must be at least 5 characters long' })
    @Matches(/^[a-zA-Z. ]+$/, {
        message: 'Full name can only contain letters, spaces, and dots',
    })
    fullName: string;

    @IsString()
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString()
    @IsEnum(Role, { message: 'Role must be patient, doctor or admin' })
    role: Role;

    @IsOptional()
    @IsString()
    @Matches(/^\d{11}$/, {
        message: 'Phone number must be exactly 11 digits',
    })
    phone?: string | null;

    @IsOptional()
    @IsEnum(Gender, { message: 'Gender must be male, female or other' })
    gender?: Gender | null;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Birth Date must be a valid date' })
    birthDate?: Date | null;

    @IsOptional()
    @IsString()
    @MinLength(5, { message: 'Address must be at least 5 characters long' })
    address?: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message:
            'Password must contain at least one number and one special character',
    })
    password: string;

    @IsString()
    @IsOptional()
    refreshToken?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Created At must be a valid date' })
    createdAt?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Updated At must be a valid date' })
    updatedAt?: Date;
}
