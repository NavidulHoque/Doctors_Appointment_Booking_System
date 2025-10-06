import { IsRequiredString } from 'src/common/decorators';

export class BaseAuthDto {

    @IsRequiredString("Email is required")
    email: string;
}
