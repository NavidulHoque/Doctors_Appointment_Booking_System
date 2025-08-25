import {
  Controller,
  Post,
  Headers,
  Body
} from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
  ) { }

  @Post('stripe')
  async handleStripeWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.webhookService.handleStripeEvent(body, signature);
    return { received: true };
  }
}

