import {
    IsNotEmpty,
    IsOptional,
    IsString
} from 'class-validator';
import { BaseAuthDto } from './baseAuth.dto';

export class LoginDto extends BaseAuthDto {

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsString()
    @IsOptional()
    deviceName?: string;

    @IsString()
    @IsNotEmpty({ message: 'Role is required' })
    role: string;
}
