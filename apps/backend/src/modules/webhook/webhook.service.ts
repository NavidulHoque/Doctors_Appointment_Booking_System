import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Payment, Appointment } from '@dab/database';
import { PaymentStatus } from '@dab/shared';
import { EnvService } from '@dab/backend/modules/config/env.service';
import { NotificationService } from '@dab/backend/modules/notification/notification.service';

@Injectable()
export class WebhookService {
	private readonly stripe: Stripe;
	private readonly logger = new Logger(WebhookService.name);

	constructor(
		private readonly env: EnvService,
		@InjectRepository(Payment)
		private readonly paymentRepo: Repository<Payment>,
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
		private readonly notificationService: NotificationService,
	) {
		this.stripe = new Stripe(env.stripe.secretKey, { apiVersion: '2025-04-30.basil' });
	}

	async handleStripeEvent(rawBody: Buffer, signature: string) {
		const event = this.stripe.webhooks.constructEvent(
			rawBody,
			signature,
			this.env.stripe.webhookSecret,
		);

		switch (event.type) {
			case 'checkout.session.completed':
				await this.handleSuccessfulCheckout(event.data.object as Stripe.Checkout.Session);
				break;
			case 'checkout.session.expired':
				await this.handleExpiredSession(event.data.object as Stripe.Checkout.Session);
				break;
			default:
				this.logger.log(`Unhandled Stripe event: ${event.type}`);
		}
	}

	private async handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
		await this.paymentRepo.update(
			{ transactionId: session.id },
			{ transactionId: session.payment_intent as string, status: PaymentStatus.COMPLETED },
		);

		const appointmentId = session.metadata?.appointmentId;
		if (appointmentId) {
			await this.appointmentRepo.update(
				{ id: appointmentId },
				{ isPaid: true, paymentMethod: 'ONLINE' },
			);
		}
	}

	private async handleExpiredSession(session: Stripe.Checkout.Session) {
		const payment = await this.paymentRepo.findOne({
			where: { transactionId: session.id },
			relations: ['appointment', 'appointment.doctor'],
		});

		if (!payment) return;

		await this.paymentRepo.delete({ id: payment.id });

		const doctorName = (payment.appointment as unknown as { doctor?: { fullName?: string } })
			?.doctor?.fullName ?? 'the doctor';

		this.notificationService
			.sendNotification(
				payment.userId,
				`Payment session expired for appointment with ${doctorName}`,
			)
			.catch((err) => this.logger.error('Failed to send expiry notification:', err));
	}
}
