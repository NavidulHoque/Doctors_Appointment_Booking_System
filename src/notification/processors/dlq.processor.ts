import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { EmailService } from "src/email";
import { PrismaService } from "src/prisma";

@Processor('failed-notification')
export class DLQProcessor {
    private readonly logger = new Logger(DLQProcessor.name);

    constructor(
        private readonly email: EmailService,
        private readonly prisma: PrismaService
    ) { }

    @Process('failed-notification')
    async handleDLQedNotification(job: Job) {
        const { userId, failedReason, traceId, failedAt, content, metadata } = job.data;

        this.logger.warn(
            `📥 DLQ job ${job.id} received for userId="${userId}" at "${failedAt.toLocaleString()}", reason="${failedReason}" with traceId="${traceId}"`,
        );

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                fullName: true,
                email: true
            }
        });

        // sending email to user
        await this.email.sendNotificationFailureEmail(user!.email, failedReason);

        await this.email.alertAdmin(
            'Notification Delivery Failed',
            `Failed to send notification,<br>
             Content: ${content},<br>
             UserId: ${userId},<br>
             metadata: ${JSON.stringify(metadata)},<br> 
             Reason: ${failedReason},<br>
             traceId=${traceId}`,
        );
    }

    @OnQueueFailed()
    async handleFailedDLQOperation(job: Job, error: any) {
        const { userId, traceId, failedAt, content, metadata } = job.data;

        this.logger.error(
            `💥 DLQ job ${job.id} also failed! for userId="${userId}" at "${failedAt}" Reason: "${error.message}" with traceId="${traceId}"`,
        );

        this.email.alertAdmin(
            'Notification Delivery Failed',
            `Failed to send notification,<br>
             Content: ${content},<br>
             UserId: ${userId},<br>
             metadata: ${JSON.stringify(metadata)},<br> 
             Reason: ${error.message},<br>
             traceId=${traceId}`
        )
            .catch((error) => this.logger.error(
                `❌ Failed to alert admin. Reason: ${error.message} with traceId=${traceId}`
            ));
    }
}
