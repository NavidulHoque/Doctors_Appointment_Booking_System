import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EnvService } from '@dab/backend/modules/config/env.service';

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);
	private readonly transporter: nodemailer.Transporter;

	constructor(private readonly env: EnvService) {
		this.transporter = nodemailer.createTransport({
			host: env.smtp.host,
			port: env.smtp.port,
			secure: env.smtp.port === 465,
			auth: { user: env.smtp.user, pass: env.smtp.pass },
		});
	}

	async sendAppointmentReminder(
		to: string,
		patientName: string,
		doctorName: string,
		appointmentDate: Date,
	): Promise<void> {
		await this.transporter.sendMail({
			from: this.env.smtp.from,
			to,
			subject: 'Appointment Reminder',
			html: `
				<h2>Appointment Reminder</h2>
				<p>Dear ${patientName},</p>
				<p>This is a reminder for your upcoming appointment with Dr. ${doctorName}.</p>
				<p><strong>Date & Time:</strong> ${appointmentDate.toLocaleString()}</p>
				<p>Please arrive on time. If you need to cancel, please do so at least 24 hours in advance.</p>
			`,
		});
	}

	async alertAdmin(subject: string, body: string): Promise<void> {
		await this.transporter.sendMail({
			from: this.env.smtp.from,
			to: this.env.adminEmail,
			subject: `[ALERT] ${subject}`,
			text: body,
		});
	}
}
