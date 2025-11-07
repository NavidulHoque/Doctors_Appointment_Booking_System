import { IsRequiredEmail, IsRequiredName, IsRequiredPassword } from 'src/common/decorators/string';

export class RegistrationDto {
    @IsRequiredName()
    readonly fullName: string;

    @IsRequiredEmail()
    readonly email: string;

    @IsRequiredPassword()
    readonly password: string;
}
