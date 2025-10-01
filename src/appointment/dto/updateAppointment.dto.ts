import { IsEnum, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { Status } from "@prisma/client";

export class UpdateAppointmentDto {

    @IsOptional()
    @IsString()
    readonly cancellationReason?: string;

    @IsOptional()
    @Transform(({ value }) => value.toUpperCase())
    @IsEnum(Status, { message: 'Status must be pending, confirmed, completed, running or cancelled' })
    readonly status?: Status;
}
