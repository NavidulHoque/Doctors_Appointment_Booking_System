import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class MessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    receiverId: string;
}

