import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio.Twilio;
  private from: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.from = this.configService.get<string>('TWILIO_PHONE_NUMBER')!;

    this.client = Twilio(accountSid, authToken);
  }

  async sendSms(to: string, body: string): Promise<void> {
    await this.client.messages.create({
      body,
      from: this.from,
      to,
    });
  }
}
