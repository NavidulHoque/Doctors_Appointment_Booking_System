import {
    IsNotEmpty,
    IsString
} from 'class-validator';
import { BaseEmailDto } from './baseEmail.dto';

export class LoginDto extends BaseEmailDto {

    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}
