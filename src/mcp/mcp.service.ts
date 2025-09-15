import { Injectable, Logger } from '@nestjs/common';
import { AppointmentService } from 'src/appointment/appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from 'src/appointment/dto';
import { GetScheduleDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(
    private readonly appointment: AppointmentService,
    private readonly prisma: PrismaService
  ){}

  async bookAppointment(dto: CreateAppointmentDto, traceId: string) {
    this.logger.log(`Booking appointment: ${JSON.stringify(dto)}`);
    
    this.appointment.createAppointment(dto, traceId);
    return { success: true, message: 'Appointment booked', data: dto };
  }

  async cancelAppointment(dto: UpdateAppointmentDto, traceId: string) {
    this.logger.log(`Cancelling appointment: ${JSON.stringify(dto)}`);
    
    this.appointment.updateAppointment(dto, traceId);
    return { success: true, message: 'Appointment cancelled', data: dto };
  }

  async getDoctorSchedule(dto: GetScheduleDto) {
    this.logger.log(`Fetching schedule for doctorId=${dto.doctorId}`);
    
    const doctor = await this.prisma.doctor.findUnique({ 
      where: { userId: dto.doctorId },
      select: {
        availableTimes: true
      }
    });
    
    return {
      success: true,
      message: 'Doctor schedule retrieved',
      data: { slots: doctor!.availableTimes },
    };
  }
}
