import { BaseAuthDto } from './base-auth.dto';
import { IsOptionalString, IsRequiredPassword } from 'src/common/decorators';

export class LoginDto extends BaseAuthDto {

    @IsRequiredPassword()
    readonly password: string;

    @IsOptionalString({ 
        stringMessage: 'Device name must be a string' 
    })
    readonly deviceName?: string;
}
