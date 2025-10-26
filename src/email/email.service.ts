import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from 'src/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly config: AppConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.smtp.host,
      port: this.config.smtp.port,
      secure: this.config.smtp.port === 465,
      auth: {
        user: this.config.smtp.user,
        pass: this.config.smtp.pass,
      },
    });
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    await this.transporter.sendMail({
      from: this.config.smtp.from,
      ...options,
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    await this.sendEmail({
      to,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}. It expires in ${this.config.otp} minutes.`,
      html: `<p>Your OTP is: <b>${otp}</b></p><p>It expires in <b>${this.config.otp}</b> minutes.</p>`,
    });
  }

  async sendNotificationFailureEmail(to: string, reason: string) {
    await this.sendEmail({
      to,
      subject: 'Notification Delivery Failed',
      text: `We were unable to deliver a notification to your account. Reason: ${reason}`,
      html: `<p>We were unable to deliver a notification to your account.</p><p>Reason: <b>${reason}</b></p>`,
    });
  }

  async alertAdmin(subject: string, message: string) {
    const adminEmail = this.config.admin.email;
    if (!adminEmail) return;

    await this.sendEmail({
      to: adminEmail,
      subject: `[ALERT] ${subject}`,
      text: message,
      html: `<p>${message}</p>`,
    });
  }
}
