// src/payment/appointment-payment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { StripeService } from 'src/stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { HandleErrorsService } from 'src/common/handleErrors.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly handleErrorsService: HandleErrorsService,
  ) { }

  async createPaymentSession(appointmentId: string, userId: string, amount: number) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) this.handleErrorsService.throwNotFoundError('Appointment not found');

      const session = await this.stripeService.createCheckoutSession(amount, appointmentId);

      await this.prisma.payment.create({
        data: {
          userId,
          appointmentId,
          amount,
          transactionId: session.id
        },
      });

      return {
        data: {
          url: session.url,
          sessionId: session.id
        },
        message: 'Payment session created successfully',
      };
    }

    catch (error) {
      this.handleErrorsService.handleError(error);
    }
  }

  async confirmPayment(sessionId: string) {
    const session = await this.stripeService.retrieveSession(sessionId);
    const paymentIntentId = session.payment_intent as string;

    const status = session.payment_status === 'paid' ? 'COMPLETED' : 'FAILED';

    const payment = await this.prisma.payment.updateMany({
      where: { transactionId: sessionId },
      data: {
        transactionId: paymentIntentId,
        status
      },
    });

    // Also mark appointment as paid if successful
    if (status === 'COMPLETED') {
      await this.prisma.appointment.updateMany({
        where: {
          id: session?.metadata?.appointmentId,
        },
        data: {
          isPaid: true,
          paymentMethod: 'ONLINE',
        },
      });
    }

    return { status };
  }
}
