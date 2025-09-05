import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { EmailService } from "src/email/email.service";
import { PrismaService } from "src/prisma/prisma.service";

@Processor('failed-notifications')
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
            'Notification Delivery Failed',
            `Failed to deliver notification to user: name = ${user!.fullName} and email = ${user!.email}. Reason: ${failedReason}`,
        );
    }

    @OnQueueFailed()
    async handleFailedDLQOperation(job: Job, error: any) {
        this.logger.error(
            `💥 DLQ job ${job.id} also failed! Reason: ${error.message} with traceId=${job.data.traceId}`,
        );

        await this.email.alertAdmin(
            'CRITICAL: DLQ Processor Failure',
            `DLQ failed for jobId=${job.id}, userId=${job.data.userId}, traceId=${job.data.traceId}. Reason: ${error.message}`
        );
    }
}
