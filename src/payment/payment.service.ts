import { Injectable } from '@nestjs/common';
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
}
