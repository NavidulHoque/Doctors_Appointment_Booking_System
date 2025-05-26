// // src/stripe/stripe.service.ts
// import { Injectable } from '@nestjs/common';
// import Stripe from 'stripe';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class StripeService {
//     private stripe: Stripe;

//     constructor(private configService: ConfigService) {
//         this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY'), {
//             apiVersion: '2023-10-16',
//         });
//     }

//     async createCheckoutSession(amount: number, appointmentId: string) {
//         const session = await this.stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             mode: 'payment',
//             line_items: [
//                 {
//                     price_data: {
//                         currency: 'usd',
//                         product_data: {
//                             name: 'Appointment Payment',
//                         },
//                         unit_amount: Math.round(amount * 100), // amount in cents
//                     },
//                     quantity: 1,
//                 },
//             ],
//             success_url: `${this.configService.get('FRONTEND_URL')}/appointment-success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${this.configService.get('FRONTEND_URL')}/appointment-cancel?session_id={CHECKOUT_SESSION_ID}`,
//             metadata: {
//                 appointmentId,
//             },
//         });

//         return session;
//     }

//     async retrieveSession(sessionId: string) {
//         return this.stripe.checkout.sessions.retrieve(sessionId);
//     }
// }
