import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Transform} from "class-transformer";
import { Status } from "@prisma/client";

export class UpdateAppointmentDto {

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.trim())
    @MinLength(5, { message: 'Cancellation reason must be at least 5 characters long' })
    readonly cancellationReason?: string;

    @IsOptional()
    @Transform(({ value }) => value.trim().toUpperCase())
    @IsEnum(Status, { message: 'Status must be pending, confirmed, completed, running or cancelled' })
    readonly status?: Status;
}
