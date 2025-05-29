import { IsBoolean, IsOptional, IsString } from "class-validator";
import { BaseAppointmentDto } from "./baseAppointment.dto";

export class UpdateAppointmentDto extends BaseAppointmentDto {

    @IsOptional()
    @IsBoolean()
    isPaid?: boolean;

    @IsOptional()
    @IsString()
    cancellationReason?: string;
}
