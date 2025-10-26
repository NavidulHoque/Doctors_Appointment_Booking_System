import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { AppConfigService } from 'src/config';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private config: AppConfigService) {
        this.stripe = new Stripe(this.config.stripe.secretKey, {
            apiVersion: '2025-08-27.basil',
        });
    }

    async createCheckoutSession(amount: number, appointmentId: string, doctorStripeAccountId: string) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Appointment Payment',
                        },
                        unit_amount: Math.round(amount * 100), // amount in cents
                    },
                    quantity: 1,
                },
            ],
            success_url: `${this.config.frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.config.frontendUrl}/cancel?session_id={CHECKOUT_SESSION_ID}`,
            expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
            metadata: {
                appointmentId,
            },
            payment_intent_data: {
                transfer_data: {
                    destination: doctorStripeAccountId, // Send money directly to doctor’s account
                },
            },
        });

        return session;
    }
}
