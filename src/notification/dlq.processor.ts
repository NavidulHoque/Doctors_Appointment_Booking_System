import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";

@Processor('failed-notifications')
export class DLQProcessor {
    private readonly logger = new Logger(DLQProcessor.name);

    @Process('failed-notification')
    async handleDLQedNotification(job: Job) {
        this.logger.warn(
            `📥 DLQ Job received for userId=${job.data.userId}, reason=${job.data.failedReason}`,
        );

        // Options:
        // 1. Save into DB for inspection
        // 2. Alert dev team via Slack/email
        // 3. Attempt different recovery logic (e.g. send email instead of notification)
    }

    @OnQueueFailed()
    async handleFailedDLQOperation(job: Job, err: any) {
        this.logger.error(
            `💥 DLQ job ${job.id} also failed! Reason: ${err.message}`,
        );
    }
}
