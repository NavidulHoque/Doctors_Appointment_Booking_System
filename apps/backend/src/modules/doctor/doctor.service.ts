import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User, Doctor, Review, Appointment } from '@dab/database';
import { Role, AppointmentStatus, WeekDays } from '@dab/shared';
import { EnvService } from '@dab/backend/modules/config/env.service';
import { RealtimeService } from '@dab/backend/modules/realtime/realtime.service';
import { SupabaseService } from '@dab/backend/modules/supabase/supabase.service';
import type { CreateDoctorDto } from '@dab/backend/modules/doctor/dtos/create-doctor.dto';
import type { GetDoctorsDto } from '@dab/backend/modules/doctor/dtos/query-doctor.dto';
import { PaginationDto } from '@dab/backend/common/dtos/pagination.dto';
import { PaginatedOutputDto } from '@dab/backend/common/dtos/response/paginated-output.dto';
import { SelectQueryBuilder } from 'typeorm/browser';

@Injectable()
export class DoctorService {
	private readonly stripe: Stripe;

	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		@InjectRepository(Doctor)
		private readonly doctorRepo: Repository<Doctor>,
		@InjectRepository(Review)
		private readonly reviewRepo: Repository<Review>,
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
		private readonly env: EnvService,
		private readonly realtime: RealtimeService,
		private readonly supabase: SupabaseService,
	) {
		this.stripe = new Stripe(this.env.stripe.secretKey, { apiVersion: '2025-04-30.basil' });
	}

	async createDoctor(dto: CreateDoctorDto) {
		// 1. Create Supabase Auth user FIRST (source of truth for ID)
		const { data, error } =
			await this.supabase.admin.auth.admin.createUser({
				email: dto.email,
				password: dto.password,
				email_confirm: true,
			});

		if (error || !data.user) {
			throw new Error(error?.message || 'Failed to create Supabase user');
		}

		const userId = data.user.id;

		// 2. Save in your DB using manual primary key
		const user = this.userRepo.create({
			id: userId,
			fullName: dto.fullName,
			role: Role.DOCTOR,
		});

		await this.userRepo.save(user);

		const workingDays = Object.values(WeekDays).map((day) => {
			return {
				day,
				startTime: '00:00',
				endTime: '00:00',
				doctorId: userId
			};
		});

		// 3. Create doctor profile
		const doctor = this.doctorRepo.create({
			userId: userId,
			specialization: dto.specialization,
			education: dto.education,
			experience: dto.experience,
			aboutMe: dto.aboutMe,
			fees: dto.fees,
			workingDays
		});

		await this.doctorRepo.save(doctor);

		return {
			message: 'Doctor created successfully',
		};
	}

	async getAllDoctors(queryParams: GetDoctorsDto) {
		const { page, limit, weekDays } = queryParams;

		const qb = this.doctorRepo
			.createQueryBuilder('doctor')
			.leftJoinAndSelect('doctor.user', 'user');

		this.applyDoctorFilters(qb, queryParams);

		let doctors = await qb.getMany();

		if (!doctors.length) throw new NotFoundException('Doctors not found');

		const sortedDoctors = await this.sortDoctors(doctors);

		const totalItems = sortedDoctors.length;
		const skip = (page - 1) * limit;
		const paginatedItems = sortedDoctors.slice(skip, skip + limit);

		return new PaginatedOutputDto<Doctor>(paginatedItems, totalItems, page, limit)
	}

	async getADoctor(doctorUserId: string, queryParams: PaginationDto) {
		const { page, limit } = queryParams;
		const skip = (page - 1) * limit;

		const doctor = await this.doctorRepo.findOne({
			where: { userId: doctorUserId },
			relations: ['user'],
		});
		if (!doctor) throw new NotFoundException('Doctor not found');

		const [reviews, totalReviews, ratingAgg, relatedDoctors, bookedDates] = await Promise.all([
			this.reviewRepo.find({
				where: { doctorId: doctorUserId },
				order: { createdAt: 'DESC' },
				skip,
				take: limit,
				relations: ['patient'],
			}),
			this.reviewRepo.count({ where: { doctorId: doctorUserId } }),
			this.reviewRepo
				.createQueryBuilder('r')
				.select('AVG(r.rating)', 'avg')
				.where('r.doctorId = :id', { id: doctorUserId })
				.getRawOne<{ avg: string | null }>(),
			this.doctorRepo.find({
				where: { specialization: doctor.specialization },
				relations: ['user'],
				take: 5,
			}),
			this.appointmentRepo.find({
				where: [
					{ doctorId: doctorUserId, status: AppointmentStatus.PENDING },
					{ doctorId: doctorUserId, status: AppointmentStatus.CONFIRMED },
				],
				select: ['date'],
			}),
		]);

		const sortedRelated = await this.sortDoctors(
			relatedDoctors.filter((d) => d.userId !== doctorUserId),
		);

		return {
			doctor: {
				...doctor,
				averageRating: ratingAgg?.avg ? parseFloat(ratingAgg.avg) : 0,
				totalReviews,
				reviews,
			},
			relatedDoctors: sortedRelated,
			bookedAppointmentDates: bookedDates.map((a) => a?.date || new Date().toISOString()),
			pagination: new PaginatedOutputDto([], totalReviews, page, limit),
			message: 'Doctor fetched successfully',
		};
	}

	async createStripeAccount(doctorUserId: string) {
		const doctor = await this.doctorRepo.findOne({
			where: { userId: doctorUserId },
			relations: ['user'],
		});
		if (!doctor) throw new NotFoundException('Doctor not found');
		if (doctor.stripeAccountId) throw new BadRequestException('Stripe account already exists');

		const account = await this.stripe.accounts.create({
			type: 'express',
		});

		await this.doctorRepo.update({ userId: doctorUserId }, { stripeAccountId: account.id });

		const link = await this.stripe.accountLinks.create({
			account: account.id,
			refresh_url: `${this.env.frontendUrl}/stripe/onboarding/refresh`,
			return_url: `${this.env.frontendUrl}/stripe/onboarding/return?accountId=${account.id}`,
			type: 'account_onboarding',
		});

		return { url: link.url, message: 'Stripe account created successfully' };
	}

	async activateStripeAccount(doctorUserId: string) {
		const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
		if (!doctor?.stripeAccountId) throw new NotFoundException('Stripe account not found');

		const account = await this.stripe.accounts.retrieve(doctor.stripeAccountId);
		const { charges_enabled, payouts_enabled, details_submitted } = account;

		if (!charges_enabled || !payouts_enabled || !details_submitted) {
			throw new BadRequestException('Stripe account not fully activated yet');
		}

		await this.doctorRepo.update({ userId: doctorUserId }, { isStripeAccountActive: true });

		await this.realtime.broadcastEvent('doctor_stripe_activated', {
			doctorId: doctorUserId,
			message: 'Stripe account activated successfully',
		});

		return { message: 'Stripe account activated successfully' };
	}

	// ----------------------- PRIVATE METHODS ----------------------
	private async sortDoctors(doctors: Doctor[]) {
		const withRatings = await Promise.all(
			doctors.map(async (doc) => {
				const [count, agg] = await Promise.all([
					this.reviewRepo.count({ where: { doctorId: doc.userId } }),
					this.reviewRepo
						.createQueryBuilder('r')
						.select('AVG(r.rating)', 'avg')
						.where('r.doctorId = :id', { id: doc.userId })
						.getRawOne<{ avg: string | null }>(),
				]);
				return { ...doc, totalReviews: count, averageRating: agg?.avg ? parseFloat(agg.avg) : 0 };
			}),
		);

		return withRatings.sort((a, b) =>
			a.averageRating !== b.averageRating
				? b.averageRating - a.averageRating
				: b.experience - a.experience,
		);
	}

	private applyDoctorFilters(qb: SelectQueryBuilder<Doctor>, queryParams: GetDoctorsDto) {
		const { specialization, experience, fees, search } = queryParams;

		if (specialization?.length) {
			qb.andWhere('doctor.specialization IN (:...specs)', {
				specs: specialization,
			});
		}

		if (experience?.length === 1) {
			qb.andWhere('doctor.experience >= :expMin', {
				expMin: experience[0],
			});
		}

		if (experience?.length === 2) {
			qb.andWhere('doctor.experience BETWEEN :expMin AND :expMax', {
				expMin: experience[0],
				expMax: experience[1],
			});
		}

		if (fees?.length === 1) {
			qb.andWhere('doctor.fees <= :feesMax', {
				feesMax: fees[0],
			});
		}

		if (fees?.length === 2) {
			qb.andWhere('doctor.fees BETWEEN :feesMin AND :feesMax', {
				feesMin: fees[0],
				feesMax: fees[1],
			});
		}

		if (search !== undefined) {
			qb.andWhere(
				`(
			        LOWER(doctor.specialization) LIKE :search OR
			        LOWER(doctor.education) LIKE :search OR
			        LOWER(doctor.aboutMe) LIKE :search OR
			        LOWER(user.fullName) LIKE :search
		        )`,
				{ search: `%${search.toLowerCase()}%` },
			);
		}
	}
}
