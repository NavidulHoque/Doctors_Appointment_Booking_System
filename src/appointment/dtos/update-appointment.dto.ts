import { Status } from "@prisma/client";
import { IsOptionalEnum, IsOptionalString } from "src/common/decorators";

export class UpdateAppointmentDto {

    @IsOptionalString({ 
        stringMessage: 'Cancellation reason must be a string',
        minLength: 5,
        minLengthMessage: 'Cancellation reason must be at least 5 characters long', 
    })
    readonly cancellationReason?: string;

    @IsOptionalEnum({ 
        enumType: Status, 
        message: `Status must be one of the following values: ${Object.values(Status).join(', ').toLowerCase()}`, 
        isUppercase: true 
    })
    readonly status?: Status;
}
