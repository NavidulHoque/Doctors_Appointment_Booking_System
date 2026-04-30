import { Module } from '@nestjs/common';
import { EmailService } from '@dab/backend/modules/email/email.service';

@Module({
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
