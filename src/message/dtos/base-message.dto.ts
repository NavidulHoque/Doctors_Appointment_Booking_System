import { IsRequiredString } from 'src/common/decorators';

export class BaseMessageDto {
    @IsRequiredString({
        requiredMessage: 'Content is required',
        stringMessage: 'Content must be a string',
    })
    readonly content: string;

    @IsRequiredString({
        requiredMessage: 'Receiver ID is required',
        stringMessage: 'Receiver ID must be a string',
    })
    readonly receiverId: string;
}

