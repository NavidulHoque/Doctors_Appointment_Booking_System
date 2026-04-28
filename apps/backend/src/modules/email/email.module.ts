import { Module } from '@nestjs/common';
import { EmailService } from '@backend/modules/email/email.service';

@Module({
	providers: [EmailService],
	exports: [EmailService],
})
export class EmailModule {}
