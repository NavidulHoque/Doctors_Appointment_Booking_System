import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { Method, Status } from "@prisma/client";

export class UpdateAppointmentDto {

    @IsOptional()
    @IsBoolean()
    readonly isPaid?: boolean;

    @IsOptional()
    @IsString()
    readonly cancellationReason?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.toUpperCase())
    @IsEnum(Status, { message: 'Status must be pending, confirmed, completed, running or cancelled' })
    readonly status?: Status;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value.toUpperCase())
    @IsEnum(Method, { message: 'Payment method must be cash or online' })
    readonly paymentMethod?: Method;
}
