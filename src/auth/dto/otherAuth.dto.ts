import { IsOptional, IsString } from "class-validator";

export class OtherAuthDto {

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    otp?: string;

    @IsOptional()
    @IsString()
    newPassword?: string;

    @IsOptional()
    @IsString()
    refreshToken?: string;
}