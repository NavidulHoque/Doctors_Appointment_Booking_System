import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { EnvService } from '@backend/modules/config/env.service';

@Injectable()
export class StripeService {
	readonly client: Stripe;

	constructor(private readonly env: EnvService) {
		this.client = new Stripe(env.stripe.secretKey, { apiVersion: '2025-04-30.basil' });
	}

	async createCheckoutSession(params: {
		appointmentId: string;
		amount: number;
		doctorStripeAccountId: string;
		successUrl: string;
		cancelUrl: string;
	}): Promise<Stripe.Checkout.Session> {
		const { appointmentId, amount, doctorStripeAccountId, successUrl, cancelUrl } = params;

		return this.client.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: { name: 'Doctor Appointment' },
						unit_amount: amount * 100,
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: successUrl,
			cancel_url: cancelUrl,
			expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
			metadata: { appointmentId },
			payment_intent_data: {
				transfer_data: { destination: doctorStripeAccountId },
			},
		});
	}
}
