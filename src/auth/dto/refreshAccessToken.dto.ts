import { IsNotEmpty, IsString } from "class-validator";

export class RefreshAccessTokenDto {
    
    @IsNotEmpty()
    @IsString()
    sessionId: string;

    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}