import { Controller, Post, Body, UseGuards, Get, Query, ParseIntPipe, Param } from '@nestjs/common';
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
  createSession(
    @Body() body: { appointmentId: string; amount: number },
    @User() user: UserDto
  ) {
    this.checkRoleService.checkIsPatient(user.role);
    return this.paymentService.createPaymentSession(body.appointmentId, user.id, body.amount);
  }

  @Get('payment-history')
  getAllPaymentHistory(
    @User() user: UserDto,
    @Query('status') status: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    this.checkRoleService.checkIsPatient(user.role)
    return this.paymentService.getAllPaymentHistory(status, page, limit, user.id)
  }
}
