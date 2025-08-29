import { IsNotEmpty, IsString } from "class-validator";

export class RefreshAccessTokenDto {
    
    @IsNotEmpty()
    @IsString()
    sessionId: string;
}