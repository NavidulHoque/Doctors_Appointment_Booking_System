import { IsRequiredString, IsRequiredUUID } from 'src/common/decorators/string';

export class BaseMessageDto {
    @IsRequiredString({
        requiredMessage: 'Content is required',
        stringMessage: 'Content must be a string',
    })
    readonly content: string;

    @IsRequiredUUID({
        requiredMessage: 'Receiver ID is required',
        stringMessage: 'Receiver ID must be a valid string',
    })
    readonly receiverId: string;
}

