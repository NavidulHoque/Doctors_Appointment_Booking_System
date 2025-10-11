import { Injectable, Logger } from "@nestjs/common";
import { EmailService } from "src/email/email.service";
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class AuthNotificationHelper {
    private readonly logger = new Logger(AuthNotificationHelper.name);
    constructor(private readonly email: EmailService) { }

    async handleNotificationFailure(
        actionDescription: string,
        error: Error,
        user: Pick<PrismaUser, 'id' | 'email'>,
        traceId: string
    ) {
        this.logger.error(`❌ Failed to ${actionDescription}, Reason: ${error.message} with traceId=${traceId}`);

        try {
            await this.email.alertAdmin(
                `Failed to ${actionDescription}`,
                `Failed to ${actionDescription} userId=${user.id}, email=${user.email}, Reason: ${error.message} with traceId=${traceId}`
            );
        } catch (adminError) {
            this.logger.error(`❌ Failed to alert admin. Reason: ${adminError.message} with traceId=${traceId}`);
        }
    }
}
