// src/payment/appointment-payment.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-session')
  async createSession(@Body() body: { appointmentId: string; userId: string; amount: number }) {
    return this.paymentService.createPaymentSession(body.appointmentId, body.userId, body.amount);
  }

  @Post('confirm/:sessionId')
  async confirm(@Param('sessionId') sessionId: string) {
    return this.paymentService.confirmPayment(sessionId);
  }
}
