// src/payment/appointment-payment.controller.ts
import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from 'src/auth/guard';
import { UserDto } from 'src/user/dto';
import { User } from 'src/user/decorator';
import { CheckRoleService } from 'src/common/checkRole.service';

@UseGuards(AuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly checkRoleService: CheckRoleService
  ) {}

  @Post('create-session')
  async createSession(
    @Body() body: { appointmentId: string; userId: string; amount: number },
    @User() user: UserDto
  ) {
    this.checkRoleService.checkIsPatient(user.role);
    return this.paymentService.createPaymentSession(body.appointmentId, body.userId, body.amount);
  }

  @Post('confirm/:sessionId')
  async confirm(@Param('sessionId') sessionId: string) {
    return this.paymentService.confirmPayment(sessionId);
  }
}
