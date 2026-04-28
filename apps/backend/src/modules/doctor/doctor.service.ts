import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import Stripe from 'stripe';
import { User, Doctor, Review, Appointment } from '@dab/database';
import { Role, AppointmentStatus } from '@dab/shared';
import { EnvService } from '@backend/modules/config/env.service';
import { RealtimeService } from '@backend/modules/realtime/realtime.service';
import { SupabaseService } from '@backend/modules/supabase/supabase.service';
import { PaginationDto, PaginationResponseDto } from '@backend/common/dtos/pagination.dto';
import type { CreateDoctorDto } from '@backend/modules/doctor/dtos/create-doctor.dto';
import type { UpdateDoctorDto } from '@backend/modules/doctor/dtos/update-doctor.dto';
import type { GetDoctorsDto } from '@backend/modules/doctor/dtos/query-doctor.dto';
import type { WeekDayType } from '@dab/shared';

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
		const hashedPassword = await argon2.hash(dto.password);

		const user = this.userRepo.create({
			fullName: dto.fullName,
			email: dto.email,
			password: hashedPassword,
			role: Role.DOCTOR,
		});
		await this.userRepo.save(user);

		const doctor = this.doctorRepo.create({
			userId: user.id,
			specialization: dto.specialization,
			education: dto.education,
			experience: dto.experience,
			aboutMe: dto.aboutMe,
			fees: dto.fees,
			availableTimes: dto.availableTimes,
		});
		await this.doctorRepo.save(doctor);

		// Create Supabase Auth user with matching UUID — doctors are pre-confirmed by admin
		await this.supabase.admin.auth.admin.createUser({
			id: user.id,
			email: dto.email,
			password: dto.password,
			email_confirm: true,
		});

		return {
			message: 'Doctor created successfully',
			data: { ...doctor, user: { id: user.id, fullName: user.fullName, email: user.email } },
		};
	}

	async getAllDoctors(queryParams: GetDoctorsDto) {
		const { page, limit, search, specialization, experience, fees, weekDays, isActive } = queryParams;

		const query: Record<string, unknown> = {};
		if (specialization) query['specialization'] = specialization;
		if (isActive !== undefined) query['isActive'] = isActive;
		if (experience?.length) {
			query['experienceMin'] = experience[0];
			if (experience.length > 1) query['experienceMax'] = experience[1];
		}
		if (fees?.length) {
			query['feesMax'] = fees[0];
			if (fees.length > 1) { query['feesMin'] = fees[0]; query['feesMax'] = fees[1]; }
		}

		let qb = this.doctorRepo
			.createQueryBuilder('doctor')
			.leftJoinAndSelect('doctor.user', 'user');

		if (specialization) {
			qb = qb.andWhere('LOWER(doctor.specialization) LIKE LOWER(:spec)', { spec: `%${specialization}%` });
		}
		if (isActive !== undefined) qb = qb.andWhere('doctor.isActive = :isActive', { isActive });
		if (experience?.length === 1) qb = qb.andWhere('doctor.experience >= :expMin', { expMin: experience[0] });
		if (experience?.length === 2) {
			qb = qb.andWhere('doctor.experience BETWEEN :expMin AND :expMax', { expMin: experience[0], expMax: experience[1] });
		}
		if (fees?.length === 1) qb = qb.andWhere('doctor.fees <= :feesMax', { feesMax: fees[0] });
		if (fees?.length === 2) {
			qb = qb.andWhere('doctor.fees BETWEEN :feesMin AND :feesMax', { feesMin: fees[0], feesMax: fees[1] });
		}

		let doctors = await qb.getMany();

		if (!doctors.length) throw new NotFoundException('Doctors not found');

		// In-memory filter for search and weekDays
		doctors = this.filterDoctors(doctors, { search, weekDays });

		const sortedDoctors = await this.sortDoctors(doctors);

		const totalItems = sortedDoctors.length;
		const skip = (page - 1) * limit;
		const paginatedItems = sortedDoctors.slice(skip, skip + limit);

		return {
			doctors: paginatedItems,
			pagination: new PaginationResponseDto(totalItems, page, limit),
			message: 'Doctors fetched successfully',
		};
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
				where: { specialization: doctor.specialization, isActive: true },
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
			bookedAppointmentDates: bookedDates.map((a) => a.date),
			pagination: new PaginationResponseDto(totalReviews, page, limit),
			message: 'Doctor fetched successfully',
		};
	}

	async updateDoctor(dto: UpdateDoctorDto, doctorId: string) {
		if (dto.currentPassword && dto.newPassword) {
			await this.updatePassword(doctorId, dto.currentPassword, dto.newPassword);
		}

		// Update user profile fields
		const userUpdate: Partial<User> = {};
		if (dto.fullName) userUpdate.fullName = dto.fullName;
		if (dto.email) {
			const existing = await this.userRepo.findOne({ where: { email: dto.email } });
			if (existing && existing.id !== doctorId) throw new BadRequestException('Email already exists');
			userUpdate.email = dto.email;
		}
		if (Object.keys(userUpdate).length) await this.userRepo.update({ id: doctorId }, userUpdate);

		// Update doctor profile fields
		const doctor = await this.doctorRepo.findOne({ where: { userId: doctorId } });
		if (!doctor) throw new NotFoundException('Doctor not found');

		const doctorUpdate: Partial<Doctor> = {};
		if (dto.specialization) doctorUpdate.specialization = dto.specialization;
		if (dto.education) doctorUpdate.education = dto.education;
		if (dto.experience !== undefined) doctorUpdate.experience = dto.experience;
		if (dto.aboutMe) doctorUpdate.aboutMe = dto.aboutMe;
		if (dto.fees !== undefined) doctorUpdate.fees = dto.fees;
		if (dto.isActive !== undefined) doctorUpdate.isActive = dto.isActive;

		if (dto.addAvailableTime) {
			doctorUpdate.availableTimes = [...doctor.availableTimes, dto.addAvailableTime];
		}
		if (dto.removeAvailableTime) {
			doctorUpdate.availableTimes = doctor.availableTimes.filter((t) => t !== dto.removeAvailableTime);
		}

		if (Object.keys(doctorUpdate).length) {
			await this.doctorRepo.update({ userId: doctorId }, doctorUpdate);
		}

		return { message: "Doctor's profile updated successfully" };
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
			email: doctor.user.email,
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

	async deleteDoctor(doctorUserId: string, adminId: string) {
		const doctor = await this.doctorRepo.findOne({ where: { userId: doctorUserId } });
		if (!doctor) throw new NotFoundException('Doctor not found');

		await this.doctorRepo.delete({ userId: doctorUserId });

		await this.realtime.broadcastEvent('doctor_deleted', {
			doctorId: doctorUserId,
			adminId,
			message: 'Doctor deleted successfully',
		});

		return { message: 'Doctor deleted successfully' };
	}

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

	private filterDoctors(
		doctors: Doctor[],
		{ search, weekDays }: { search?: string; weekDays?: WeekDayType[] },
	): Doctor[] {
		return doctors.filter((doc) => {
			const user = doc.user as unknown as User;
			const times = doc.availableTimes?.map((t) => t.toLowerCase()) ?? [];

			const matchSearch = search
				? doc.specialization?.toLowerCase().includes(search) ||
					doc.education?.toLowerCase().includes(search) ||
					doc.aboutMe?.toLowerCase().includes(search) ||
					user?.fullName?.toLowerCase().includes(search) ||
					user?.email?.toLowerCase().includes(search) ||
					times.some((t) => t.includes(search))
				: true;

			const matchDays = weekDays?.length
				? times.some((t) => weekDays.some((day) => t.includes(day)))
				: true;

			return matchSearch && matchDays;
		});
	}

	private async updatePassword(doctorId: string, currentPassword: string, newPassword: string) {
		const user = await this.userRepo.findOne({ where: { id: doctorId } });
		if (!user) throw new NotFoundException('User not found');

		const isMatch = await argon2.verify(user.password, currentPassword);
		if (!isMatch) throw new BadRequestException('Current password is incorrect');

		const hashed = await argon2.hash(newPassword);
		await this.userRepo.update({ id: doctorId }, { password: hashed });

		// Also update in Supabase Auth
		await this.supabase.admin.auth.admin.updateUserById(doctorId, { password: newPassword });
	}
}
