import { Method, Status } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class BaseAppointmentDto {
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
