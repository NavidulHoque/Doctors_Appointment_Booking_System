import { BaseAuthDto } from './base-auth.dto';
import { IsOptionalString, IsRequiredString } from 'src/common/decorators';

export class LoginDto extends BaseAuthDto {

    @IsRequiredString({ 
        requiredMessage: 'Password is required', 
        stringMessage: 'Password must be a string',
        minLength: 8,
        minLengthMessage: 'Password must be at least 8 characters long',
    })
    password: string;

    @IsOptionalString({ stringMessage: 'Device name must be a string' })
    deviceName?: string;
}
