import { IsOptional, IsString } from "class-validator";
import { BaseEmailDto } from "./baseEmail.dto";

export class OtherAuthDto extends BaseEmailDto {

    @IsOptional()
    @IsString()
    otp: string;

    @IsOptional()
    @IsString()
    newPassword: string;
}