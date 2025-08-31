// import { Injectable } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';

// @Injectable()
export class EmailService {
  // private transporter;

  // constructor() {
  //   this.transporter = nodemailer.createTransport({
  //     host: process.env.SMTP_HOST,
  //     port: Number(process.env.SMTP_PORT || 587),
  //     secure: false,
  //     auth: {
  //       user: process.env.SMTP_USER,
  //       pass: process.env.SMTP_PASS,
  //     },
  //   });
  // }

  // async sendOtpEmail(to: string, otp: string) {
  //   await this.transporter.sendMail({
  //     from: process.env.SMTP_FROM,
  //     to,
  //     subject: 'Your OTP Code',
  //     text: `Your OTP is: ${otp}. It expires in ${process.env.OTP_EXPIRES_MINUTES} minutes.`,
  //   });
  // }
}
