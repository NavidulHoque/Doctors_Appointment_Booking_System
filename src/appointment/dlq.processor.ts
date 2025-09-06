import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { EmailService } from "src/email/email.service";
import { PrismaService } from "src/prisma/prisma.service";

@Processor('failed-appointment')
export class DLQProcessor {
    private readonly logger = new Logger(DLQProcessor.name);

    constructor(
        private readonly email: EmailService,
        private readonly prisma: PrismaService
    ) { }

    @Process('failed-appointment')
    async handleDLQedAppointment(job: Job) {
        const { userId, failedReason, traceId } = job.data;

        this.logger.warn(
            `📥 DLQ Job received for userId=${userId}, reason=${failedReason} with traceId=${traceId}`,
        );

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                fullName: true,
                email: true
            }
        });

        await this.email.sendNotificationFailureEmail(user!.email, failedReason);

        await this.email.alertAdmin(
            'Appointment Status Update Failed',
            `Failed to update appointment status of userId=${userId}, Reason: ${failedReason} with traceId=${traceId}`,
        );
    }

    @OnQueueFailed()
    async handleFailedDLQOperation(job: Job, error: any) {
        this.logger.error(
            `💥 DLQ job ${job.id} also failed! Reason: ${error.message} with traceId=${job.data.traceId}`,
        );

        this.email.alertAdmin(
            'CRITICAL: DLQ Processor Failure',
            `DLQ failed for jobId=${job.id}, userId=${job.data.userId}, traceId=${job.data.traceId}. Reason: ${error.message}`
        )
            .catch((error) => this.logger.error(
                `❌ Failed to alert admin. Reason: ${error.message} with traceId=${job.data.traceId}`
            ));
    }
}
