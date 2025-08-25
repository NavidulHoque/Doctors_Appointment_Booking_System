import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HandleErrorsService } from "src/common/handleErrors.service";
import { NotificationService } from "src/notification/notification.service";
import { PrismaService } from "src/prisma/prisma.service";
import Stripe from "stripe";

@Injectable()
export class WebhookService {
    private stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly handleErrorsService: HandleErrorsService,
        private readonly notificationService: NotificationService
    ) {
        this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY')!, {
            apiVersion: '2025-04-30.basil',
        });
    }

    async handleStripeEvent(body: string, signature: string) {
        try {
            const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
            const event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret!);

            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleSuccessfulCheckout(event.data.object as Stripe.Checkout.Session);
                    break;

                case 'checkout.session.expired':
                    await this.handleExpiredSession(event.data.object as Stripe.Checkout.Session);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error);
        }
    }

    private async handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
        await this.prisma.payment.update({
            where: { transactionId: session.id },
            data: {
                transactionId: session.payment_intent as string,
                status: 'COMPLETED',
            },
        });

        const appointmentId = session.metadata?.appointmentId;

        await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                isPaid: true,
                paymentMethod: 'ONLINE',
            },
        });
    }

    private async handleExpiredSession(session: Stripe.Checkout.Session) {

        const payment = await this.prisma.payment.delete({
            where: { transactionId: session.id },
            select: {
                userId: true,
                appointment: {
                    select: {
                        doctor: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                }
            }
        });

        this.notificationService.sendNotifications(payment.userId, `Payment session expired for appointment with ${payment.appointment.doctor.fullName}`);
    }
}
