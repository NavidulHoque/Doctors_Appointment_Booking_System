import { IsNotEmpty, IsString } from "class-validator";

export class BaseEmailDto {
    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
}