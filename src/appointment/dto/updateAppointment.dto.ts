import { IsBoolean, IsOptional, IsString } from "class-validator";
import { BaseAppointmentDto } from "./baseAppointment.dto";

export class UpdateAppointmentDto extends BaseAppointmentDto {

    @IsOptional()
    @IsBoolean()
    readonly isPaid?: boolean;

    @IsOptional()
    @IsString()
    readonly cancellationReason?: string;
}
