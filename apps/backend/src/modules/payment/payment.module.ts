import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment, Appointment, Doctor } from '@dab/database';
import { PaymentService } from '@dab/backend/modules/payment/payment.service';
import { PaymentController } from '@dab/backend/modules/payment/payment.controller';
import { StripeService } from '@dab/backend/modules/payment/stripe.service';

@Module({
	imports: [TypeOrmModule.forFeature([Payment, Appointment, Doctor])],
	providers: [PaymentService, StripeService],
	controllers: [PaymentController],
	exports: [StripeService],
})
export class PaymentModule {}
