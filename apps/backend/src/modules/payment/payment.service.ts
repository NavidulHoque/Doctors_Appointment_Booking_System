import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, Appointment, Doctor } from '@dab/database';
import { PaymentStatus, type PaymentStatusType } from '@dab/shared';
import { EnvService } from '@backend/modules/config/env.service';
import { StripeService } from '@backend/modules/payment/stripe.service';
import type { User } from '@dab/database';

@Injectable()
export class PaymentService {
	constructor(
		@InjectRepository(Payment)
		private readonly paymentRepo: Repository<Payment>,
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
		@InjectRepository(Doctor)
		private readonly doctorRepo: Repository<Doctor>,
		private readonly stripe: StripeService,
		private readonly env: EnvService,
	) {}

	async createPaymentSession(appointmentId: string, user: User) {
		const appointment = await this.appointmentRepo.findOne({ where: { id: appointmentId } });
		if (!appointment) throw new NotFoundException('Appointment not found');

		const doctor = await this.doctorRepo.findOne({ where: { userId: appointment.doctorId } });
		if (!doctor) throw new NotFoundException('Doctor not found');

		if (!doctor.isStripeAccountActive || !doctor.stripeAccountId) {
			throw new BadRequestException('Doctor has not set up their payment account yet');
		}

		const session = await this.stripe.createCheckoutSession({
			appointmentId,
			amount: doctor.fees,
			doctorStripeAccountId: doctor.stripeAccountId,
			successUrl: `${this.env.frontendUrl}/payment/success`,
			cancelUrl: `${this.env.frontendUrl}/payment/cancel`,
		});

		await this.paymentRepo.save(
			this.paymentRepo.create({
				userId: user.id,
				appointmentId,
				amount: doctor.fees,
				transactionId: session.id,
				status: PaymentStatus.PENDING,
			}),
		);

		return { url: session.url, message: 'Payment session created' };
	}

	async getAllPaymentHistory(userId: string, status?: PaymentStatusType) {
		const payments = await this.paymentRepo.find({
			where: { userId, ...(status && { status }) },
			order: { createdAt: 'DESC' },
			relations: ['appointment'],
		});

		return { payments, message: 'Payment history fetched successfully' };
	}
}
