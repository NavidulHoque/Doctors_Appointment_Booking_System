import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBadRequestResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentService } from '@backend/modules/payment/payment.service';
import { CreatePaymentSessionDto } from '@backend/modules/payment/dtos/create-payment.dto';
import { GetPaymentHistoryDto } from '@backend/modules/payment/dtos/get-payment-history.dto';
import { CurrentUser } from '@backend/common/decorators/current-user.decorator';
import type { User } from '@dab/database';

@ApiTags('payments')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
@Controller('payments')
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@Post('session')
	@ApiOperation({ summary: 'Create a Stripe checkout session for an appointment' })
	@ApiCreatedResponse({ description: 'Checkout session URL returned' })
	@ApiNotFoundResponse({ description: 'Appointment not found' })
	@ApiBadRequestResponse({ description: 'Appointment already paid or not confirmed' })
	createSession(@Body() dto: CreatePaymentSessionDto, @CurrentUser() user: User) {
		return this.paymentService.createPaymentSession(dto.appointmentId, user);
	}

	@Get('history')
	@ApiOperation({ summary: 'Get payment history for current user' })
	@ApiOkResponse({ description: 'List of payments returned' })
	getHistory(@Query() query: GetPaymentHistoryDto, @CurrentUser() user: User) {
		return this.paymentService.getAllPaymentHistory(user.id, query.status);
	}
}
