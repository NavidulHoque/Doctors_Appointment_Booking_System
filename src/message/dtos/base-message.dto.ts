import { IsString, IsNotEmpty } from 'class-validator';

export class BaseMessageDto {
    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsString()
    @IsNotEmpty()
    receiverId!: string;
}

