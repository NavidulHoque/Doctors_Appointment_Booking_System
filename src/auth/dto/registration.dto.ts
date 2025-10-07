import { IsRequiredEmail, IsRequiredString } from 'src/common/decorators';

export class RegistrationDto {
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
    fullName: string;

    @IsRequiredEmail()
    email: string;

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
    password: string;
}
