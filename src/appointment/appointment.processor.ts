import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { AppointmentService } from './appointment.service';

@Processor('appointment-queue')
export class AppointmentProcessor {
    constructor(
        private readonly appointmentService: AppointmentService
    ) { }

    @Process('start-appointment')
    async handleStartAppointment(job: Job) {
        const { status, id } = job.data;
        const dto = { status }
        await this.appointmentService.updateAppointment(dto, id);
    }
}
