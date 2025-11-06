import { Status } from "@prisma/client";
import { IsOptionalCancellationReason, IsOptionalStatus } from "src/common/decorators";

export class UpdateAppointmentDto {

    @IsOptionalCancellationReason()
    readonly cancellationReason?: string;

    @IsOptionalStatus()
    readonly status?: Status;
}
