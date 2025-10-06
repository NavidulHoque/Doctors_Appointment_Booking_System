import { BaseAuthDto } from './base-auth.dto';
import { IsOptionalString, IsRequiredString } from 'src/common/decorators';

export class LoginDto extends BaseAuthDto {

    @IsRequiredString("Password is required")
    password: string;

    @IsOptionalString()
    deviceName?: string;
}
