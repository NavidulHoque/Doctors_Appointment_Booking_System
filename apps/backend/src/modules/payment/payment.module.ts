import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment, Appointment, Doctor } from '@dab/database';
import { PaymentService } from '@backend/modules/payment/payment.service';
import { PaymentController } from '@backend/modules/payment/payment.controller';
import { StripeService } from '@backend/modules/payment/stripe.service';

@Module({
	imports: [TypeOrmModule.forFeature([Payment, Appointment, Doctor])],
	providers: [PaymentService, StripeService],
	controllers: [PaymentController],
	exports: [StripeService],
})
export class PaymentModule {}
