import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, MoreThan, Not, Repository } from 'typeorm';
import Stripe from 'stripe';
import { User, Doctor, Review, Appointment } from '@dab/database';
import { Role, AppointmentStatus, WeekDays, StripeAccountStatus } from '@dab/shared';
import { EnvService } from '@dab/backend/modules/config/env.service';
import { RealtimeService } from '@dab/backend/modules/realtime/realtime.service';
import { SupabaseService } from '@dab/backend/modules/supabase/supabase.service';
import type { CreateDoctorDto } from '@dab/backend/modules/doctor/dtos/create-doctor.dto';
import type { GetDoctorsDto } from '@dab/backend/modules/doctor/dtos/query-doctor.dto';
import { PaginationDto } from '@dab/backend/common/dtos/pagination.dto';
import { PaginatedOutputDto } from '@dab/backend/common/dtos/response/paginated-output.dto';
import { SelectQueryBuilder } from 'typeorm/browser';
import { WebhookService } from '../webhook/webhook.service';
import { StripeStatusMapper } from '../../common/mappers/stripe-status.mapper';

@Injectable()
export class DoctorService {
	private readonly stripe: Stripe;

	constructor(
		@InjectRepository(Doctor)
		private readonly doctorRepo: Repository<Doctor>,
		@InjectRepository(Review)
		private readonly reviewRepo: Repository<Review>,
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
		private readonly env: EnvService,
		private readonly supabase: SupabaseService,
		private readonly dataSource: DataSource
	) {
		this.stripe = new Stripe(this.env.stripe.secretKey, { apiVersion: '2025-04-30.basil' });
	}

	async createDoctor(dto: CreateDoctorDto) {
		// Create Supabase user first
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

		try {
			await this.dataSource.transaction(async (manager) => {
				const user = manager.create(User, {
					id: userId,
					fullName: dto.fullName,
					role: Role.DOCTOR,
				});

				await manager.save(User, user);

				const workingDays = Object.values(WeekDays).map((day) => ({
					day,
					startTime: '00:00',
					endTime: '00:00',
					doctorId: userId,
				}));

				const doctor = manager.create(Doctor, {
					userId,
					specialization: dto.specialization,
					education: dto.education,
					experience: dto.experience,
					aboutMe: dto.aboutMe,
					fees: dto.fees,
					workingDays,
				});

				await manager.save(Doctor, doctor);
			});

			return {
				message: 'Doctor created successfully',
			};
		} catch (err) {
			// Compensating action:
			// remove Supabase user because DB transaction failed

			await this.supabase.admin.auth.admin.deleteUser(userId);

			throw err;
		}
	}

	async getAllDoctors(queryParams: GetDoctorsDto) {
		const { page, limit } = queryParams;

		const qb = this.doctorRepo
			.createQueryBuilder('doctor')
			.leftJoinAndSelect('doctor.user', 'user')
			.innerJoinAndSelect('doctor.workingDays', 'workingDays');

		this.applyDoctorFilters(qb, queryParams);

		const doctors = await qb.getMany();

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
			this.calculateReviewCount(doctorUserId),
			this.calculateAverageRating(doctorUserId),
			this.doctorRepo.find({
				where: {
					specialization: doctor.specialization,
					userId: Not(doctorUserId),
				},
				relations: ['user'],
				take: 5,
			}),
			this.appointmentRepo.find({
				where: [
					{ doctorId: doctorUserId, status: AppointmentStatus.PENDING, date: MoreThan(new Date()) },
					{ doctorId: doctorUserId, status: AppointmentStatus.CONFIRMED, date: MoreThan(new Date()) },
				],
				select: ['date'],
			}),
		]);

		const sortedRelatedDoctors = await this.sortDoctors(relatedDoctors);

		return {
			doctor: {
				...doctor,
				averageRating: ratingAgg?.avg ? parseFloat(ratingAgg.avg) : 0,
				totalReviews,
				reviews: new PaginatedOutputDto<Review>(reviews, totalReviews, page, limit)
			},
			relatedDoctors: sortedRelatedDoctors,
			bookedAppointmentDates: bookedDates,
			message: 'Doctor fetched successfully'
		};
	}

	async createStripeAccount(doctorUserId: string) {
		const doctor = await this.doctorRepo.findOne({
			where: { userId: doctorUserId },
		});

		if (!doctor) {
			throw new NotFoundException('Doctor not found');
		}

		if (doctor.stripeAccountId) {
			throw new BadRequestException('Stripe account already exists');
		}

		// 1. Create Stripe account (external system)
		const account = await this.stripe.accounts.create({
			type: 'express',
		});

		let link: Stripe.AccountLink;

		try {
			// 2. Create onboarding link (still external system)
			link = await this.stripe.accountLinks.create({
				account: account.id,
				refresh_url: `${this.env.frontendUrl}/stripe/onboarding/refresh`,
				return_url: `${this.env.frontendUrl}/stripe/onboarding/return?accountId=${account.id}`,
				type: 'account_onboarding',
			});

			// 3. DB update ONLY after all Stripe steps succeed
			await this.doctorRepo.update(
				{ userId: doctorUserId },
				{ stripeAccountId: account.id },
			);

			return {
				url: link.url,
				message: 'Stripe account created successfully',
			};
		} catch (error) {
			// If link creation fails or DB update fails → cleanup Stripe account
			try {
				await this.stripe.accounts.del(account.id);
			} catch (cleanupError) {
				console.error('Failed to rollback Stripe account:', cleanupError);
			}

			throw error;
		}
	}

	async syncStripeAccountStatus(doctorUserId: string) {
		const doctor = await this.doctorRepo.findOne({
			where: { userId: doctorUserId },
		});

		if (!doctor?.stripeAccountId) {
			throw new NotFoundException('Stripe account not found');
		}

		const account = await this.stripe.accounts.retrieve(doctor.stripeAccountId);

		const status = StripeStatusMapper.map(account);

		await this.doctorRepo.update(
			{ userId: doctorUserId },
			{ stripeAccountStatus: status },
		);

		return {
			message: 'Stripe status synced successfully'
		};
	}

	// ----------------------- PRIVATE METHODS ----------------------
	private async sortDoctors(doctors: Doctor[]) {
		const withRatings = await Promise.all(
			doctors.map(async (doc) => {
				const [count, agg] = await Promise.all([
					this.calculateReviewCount(doc.userId),
					this.calculateAverageRating(doc.userId)
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
		const { specialization, experience, fees, search, weekDays } = queryParams;

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

		if (weekDays?.length) {
			qb.andWhere('workingDays.day IN (:...weekDays)', {
				weekDays,
			});
		}
	}

	private calculateAverageRating(doctorId: string) {
		return this.reviewRepo
			.createQueryBuilder('review')
			.select('AVG(review.rating)', 'avg')
			.where('review.doctorId = :id', { id: doctorId })
			.getRawOne<{ avg: string | null }>()
	}

	private calculateReviewCount(doctorId: string) {
		return this.reviewRepo.count({ where: { doctorId } });
	}
}
