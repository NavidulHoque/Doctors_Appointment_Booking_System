import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { EmailService } from "src/email";

@Processor('failed-appointment')
export class DLQProcessor {
    private readonly logger = new Logger(DLQProcessor.name);

    constructor(
        private readonly email: EmailService
    ) { }

    @Process('failed-appointment')
    async handleDLQedAppointment(job: Job) {
        const { appointmentId, failedReason, traceId, failedAt, status } = job.data;

        this.logger.warn(
            `📥 DLQ Job ${job.id} received for appointmentId="${appointmentId}" at "${failedAt.toLocaleString()}", reason="${failedReason}" with traceId="${traceId}"`,
        );

        await this.email.alertAdmin(
            'Appointment Status Update Failure',
            `Failed to update appointment status,<br>
             AppointmentId=${appointmentId},<br>
             Status=${status},<br>
             TraceId=${traceId},<br>
             Reason: ${failedReason}`
        );
    }

    @OnQueueFailed()
    async handleFailedDLQOperation(job: Job, error: any) {
        const { appointmentId, traceId, failedAt, status } = job.data;

        this.logger.error(
            `💥 DLQ job ${job.id} also failed! for appointmentId="${appointmentId}" at ${failedAt} Reason: ${error.message} with traceId=${traceId}`,
        );

        this.email.alertAdmin(
            'Appointment Status Update Failure',
            `Failed to update appointment status,<br>
             AppointmentId=${appointmentId},<br>
             Status=${status},<br>
             TraceId=${traceId},<br>
             Reason: ${error.message}`
        )
            .catch((error) => this.logger.error(
                `❌ Failed to alert admin. Reason: ${error.message} with traceId=${traceId}`
            ));
    }
}
