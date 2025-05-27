import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2025-04-30.basil',
    });
  }

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret as string);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }

    // Handle event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const appointmentId = session.metadata?.appointmentId;
      const paymentIntentId = session.payment_intent as string;

      // Update payment and appointment in DB
      await this.prisma.payment.updateMany({
        where: {
          transactionId: session.id,
        },
        data: {
          transactionId: paymentIntentId,
          status: 'COMPLETED'
        },
      });

      if (appointmentId) {
        await this.prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            isPaid: true,
            paymentMethod: 'ONLINE',
          },
        });
      }

      return res.status(200).send({ received: true });
    }

    return res.status(200).send({ received: true });
  }
}
