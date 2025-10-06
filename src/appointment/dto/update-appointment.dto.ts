import { MinLength } from "class-validator";
import { Status } from "@prisma/client";
import { IsOptionalEnum, IsOptionalString } from "src/common/decorators";

export class UpdateAppointmentDto {

    @IsOptionalString()
    @MinLength(5, { message: 'Cancellation reason must be at least 5 characters long' })
    readonly cancellationReason?: string;

    @IsOptionalEnum(Status, 'Status must be pending, confirmed, completed, running or cancelled')
    readonly status?: Status;
}
