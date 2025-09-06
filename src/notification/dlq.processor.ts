import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { EmailService } from "src/email/email.service";
import { PrismaService } from "src/prisma/prisma.service";

@Processor('failed-notification')
export class DLQProcessor {
    private readonly logger = new Logger(DLQProcessor.name);

    constructor(
        private readonly email: EmailService,
        private readonly prisma: PrismaService
    ) { }

    @Process('failed-notification')
    async handleDLQedNotification(job: Job) {
        const { userId, failedReason, traceId } = job.data;

        this.logger.warn(
            `📥 DLQ job ${job.id} received for userId=${userId}, reason=${failedReason} with traceId=${traceId}`,
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
            'Notification Delivery Failed',
            `Failed to send notification,<br>
             Content: ${job.data.content},<br>
             UserId: ${job.data.userId},<br>
             metadata: ${JSON.stringify(job.data.metadata)},<br> 
             Reason: ${failedReason},<br>
             traceId=${job.data.traceId}`,
        );
    }

    @OnQueueFailed()
    async handleFailedDLQOperation(job: Job, error: any) {
        this.logger.error(
            `💥 DLQ job ${job.id} also failed! Reason: ${error.message} with traceId=${job.data.traceId}`,
        );

        this.email.alertAdmin(
            'Notification Delivery Failed',
            `Failed to send notification,<br>
             Content: ${job.data.content},<br>
             UserId: ${job.data.userId},<br>
             metadata: ${JSON.stringify(job.data.metadata)},<br> 
             Reason: ${job.data.failedReason},<br>
             traceId=${job.data.traceId}`
        )
            .catch((error) => this.logger.error(
                `❌ Failed to alert admin. Reason: ${error.message} with traceId=${job.data.traceId}`
            ));
    }
}
