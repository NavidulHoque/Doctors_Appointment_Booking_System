import { IsString, IsNotEmpty } from 'class-validator';

export class MessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    receiverId: string;
}

