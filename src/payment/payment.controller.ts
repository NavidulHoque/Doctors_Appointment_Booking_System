import { Controller, Post, Body, UseGuards, Get, Query, ParseIntPipe, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { User } from 'src/user/decorator';
import { Roles } from 'src/auth/decorators';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard, RolesGuard)
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService
  ) {}

  @Post('create-session')
  @Roles(Role.PATIENT)
  createSession(
    @Body() body: { appointmentId: string; amount: number },
    @User("id") userId: string
  ) {
    return this.paymentService.createPaymentSession(body.appointmentId, userId, body.amount);
  }

  @Get('payment-history')
  @Roles(Role.PATIENT)
  getAllPaymentHistory(
    @User("id") userId: string,
    @Query('status') status: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.paymentService.getAllPaymentHistory(status, page, limit, userId)
  }
}
