import { IsRequiredEmail } from 'src/common/decorators';

export class BaseAuthDto {

    @IsRequiredEmail()
    readonly email: string;
}
