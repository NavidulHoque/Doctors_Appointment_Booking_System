import { IsEmailField, IsName, IsPassword } from 'src/common/decorators';

export class RegistrationDto {
    @IsName()
    fullName: string;

    @IsEmailField()
    email: string;

    @IsPassword()
    password: string;
}
