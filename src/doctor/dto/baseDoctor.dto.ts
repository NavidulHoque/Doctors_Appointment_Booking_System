import { IsString, IsOptional } from 'class-validator';

export class BaseDoctorDto {
    @IsOptional()
    @IsString()
    readonly specialization?: string;
}
