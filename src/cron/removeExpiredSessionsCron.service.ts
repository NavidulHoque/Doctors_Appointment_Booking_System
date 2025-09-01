import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RemoveExpiredSessionsCronService {
    private readonly logger = new Logger(RemoveExpiredSessionsCronService.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleRemoveExpiredSessions() {

        try {
            const result = await this.prisma.session.deleteMany({
                where: {
                    expiresAt: { lt: new Date() }
                }
            });

            if (result.count > 0) {
                this.logger.log(`⏰ ${result.count} sessions are deleted.`);
            }

            else{
                this.logger.log("⏰ No expired sessions found.");
            }
        }

        catch (error) {
            this.logger.error('Failed to delete sessions:', error?.stack || error.message);
        }
    }
}