import { Injectable } from '@nestjs/common';
import { AppConfigService } from 'src/config';
import * as Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio.Twilio;
  private from: string;

  constructor(private readonly config: AppConfigService) {
    const accountSid = this.config.twilio.accountSid;
    const authToken = this.config.twilio.authToken;
    this.from = this.config.twilio.phoneNumber;

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
