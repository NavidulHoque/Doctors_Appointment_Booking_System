import { IsString, IsNotEmpty } from 'class-validator';
import { BaseMessageDto } from './baseMessage.dto';

export class CreateMessageDto extends BaseMessageDto {
    @IsString()
    @IsNotEmpty()
    idempotencyKey!: string; 
}

