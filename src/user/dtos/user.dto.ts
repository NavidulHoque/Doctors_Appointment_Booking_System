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
import { IsOptionalBirthDate } from 'src/common/decorators';

export class UserDto {

    @IsString()
    @IsOptional()
    readonly id: string;

    @IsString()
    @MinLength(5, { message: 'Full name must be at least 5 characters long' })
    @Matches(/^[a-zA-Z. ]+$/, {
        message: 'Full name can only contain letters, spaces, and dots',
    })
    readonly fullName: string;

    @IsString()
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email: string;

    @IsString()
    @IsEnum(Role, { message: 'Role must be patient, doctor or admin' })
    readonly role: Role;

    @IsOptional()
    @IsString()
    @Matches(/^\d{11}$/, {
        message: 'Phone number must be exactly 11 digits',
    })
    readonly phone?: string | null;

    @IsOptional()
    @IsEnum(Gender, { message: 'Gender must be male, female or other' })
    readonly gender?: Gender | null;

    @IsOptionalBirthDate()
    readonly birthDate?: Date;

    @IsOptional()
    @IsString()
    @MinLength(5, { message: 'Address must be at least 5 characters long' })
    readonly address?: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message:
            'Password must contain at least one number and one special character',
    })
    readonly password: string;

    @IsString()
    @IsOptional()
    readonly refreshToken?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Created At must be a valid date' })
    readonly createdAt?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Updated At must be a valid date' })
    readonly updatedAt?: Date;
}
