import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { User, Appointment } from '@dab/database';
import { AppointmentStatus, PaymentMethod, Role } from '@dab/shared';
import { EnvService } from '@backend/modules/config/env.service';
import { NotificationService } from '@backend/modules/notification/notification.service';
import { PaginationResponseDto } from '@backend/common/dtos/pagination.dto';
import type { CreateAppointmentDto } from '@backend/modules/appointment/dtos/create-appointment.dto';
import type { UpdateAppointmentDto } from '@backend/modules/appointment/dtos/update-appointment.dto';
import type { GetAppointmentsDto } from '@backend/modules/appointment/dtos/query-appointment.dto';
import { AppointmentHandler } from '@backend/modules/appointment/handlers/appointment.handler';

const TZ = 'Asia/Dhaka';

@Injectable()
export class AppointmentService {
	private readonly logger = new Logger(AppointmentService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
		private readonly env: EnvService,
		private readonly notificationService: NotificationService,
		private readonly handler: AppointmentHandler,
	) {}

	async createAppointment(dto: CreateAppointmentDto) {
		const { patientId, doctorId, date } = dto;

		const [patient, doctor] = await Promise.all([
			this.userRepo.findOne({ where: { id: patientId }, select: ['role', 'fullName'] }),
			this.userRepo.findOne({ where: { id: doctorId }, select: ['role', 'fullName'] }),
		]);

		if (!patient || !doctor) throw new BadRequestException('Patient or Doctor not found');

		if (patient.role !== Role.PATIENT || doctor.role !== Role.DOCTOR) {
			throw new BadRequestException('Invalid roles');
		}

		try {
			const appointment = this.appointmentRepo.create({ patientId, doctorId, date: new Date(date) });
			await this.appointmentRepo.save(appointment);

			this.notificationService
				.sendNotification(
					this.env.adminId,
					`${patient.fullName}'s appointment with ${doctor.fullName} is booked for ${date}.`,
				)
				.catch((err) => this.logger.error('Failed to notify admin about new appointment:', err));

			return { appointment, message: 'Appointment created successfully' };
		} catch (error: unknown) {
			if (this.isUniqueConstraintError(error)) {
				throw new BadRequestException('Appointment already exists for this date');
			}
			throw error;
		}
	}

	async getAllAppointments(query: GetAppointmentsDto, user: User) {
		const { page, limit } = query;
		const skip = (page - 1) * limit;

		const qb = this.appointmentRepo
			.createQueryBuilder('appt')
			.leftJoinAndSelect('appt.patient', 'patient')
			.leftJoinAndSelect('appt.doctor', 'doctor')
			.orderBy('appt.date', 'DESC')
			.skip(skip)
			.take(limit);

		// Role-based scope
		if (user.role === Role.PATIENT) {
			qb.andWhere('appt.patientId = :uid', { uid: user.id });
		} else if (user.role === Role.DOCTOR) {
			qb.andWhere('appt.doctorId = :uid', { uid: user.id });
		}

		if (query.status) qb.andWhere('appt.status = :status', { status: query.status });

		if (query.date) {
			qb.andWhere('appt.date = :date', { date: new Date(query.date) });
		} else if (query.isToday) {
			const today = DateTime.now().setZone(TZ);
			qb.andWhere('appt.date >= :start AND appt.date <= :end', {
				start: today.startOf('day').toJSDate(),
				end: today.endOf('day').toJSDate(),
			});
		} else if (query.isPast) {
			qb.andWhere('appt.date < :now', { now: DateTime.now().setZone(TZ).toJSDate() });
		} else if (query.isFuture) {
			qb.andWhere('appt.date > :now', { now: DateTime.now().setZone(TZ).toJSDate() });
		}

		if (query.search) {
			qb.andWhere(
				new Brackets((b) =>
					b
						.where('LOWER(patient.fullName) LIKE :s', { s: `%${query.search!.toLowerCase()}%` })
						.orWhere('LOWER(doctor.fullName) LIKE :s2', { s2: `%${query.search!.toLowerCase()}%` }),
				),
			);
		}

		const [appointments, total] = await qb.getManyAndCount();

		return {
			appointments,
			pagination: new PaginationResponseDto(total, page, limit),
		};
	}

	async getAllAppointmentCount(user: User) {
		const baseQb = () => {
			const qb = this.appointmentRepo.createQueryBuilder('appt');
			if (user.role === Role.PATIENT) qb.where('appt.patientId = :uid', { uid: user.id });
			else if (user.role === Role.DOCTOR) qb.where('appt.doctorId = :uid', { uid: user.id });
			return qb;
		};

		const [
			totalAppointments,
			uniquePatients,
			uniqueDoctors,
			totalPending,
			totalConfirmed,
			totalRunning,
			totalCompleted,
			totalCancelled,
			totalPaid,
			totalUnpaid,
			totalCash,
			totalOnline,
		] = await Promise.all([
			baseQb().getCount(),
			baseQb().select('DISTINCT appt.patientId').getRawMany(),
			baseQb().select('DISTINCT appt.doctorId').getRawMany(),
			baseQb().andWhere('appt.status = :s', { s: AppointmentStatus.PENDING }).getCount(),
			baseQb().andWhere('appt.status = :s', { s: AppointmentStatus.CONFIRMED }).getCount(),
			baseQb().andWhere('appt.status = :s', { s: AppointmentStatus.RUNNING }).getCount(),
			baseQb().andWhere('appt.status = :s', { s: AppointmentStatus.COMPLETED }).getCount(),
			baseQb().andWhere('appt.status = :s', { s: AppointmentStatus.CANCELLED }).getCount(),
			baseQb().andWhere('appt.isPaid = :p', { p: true }).getCount(),
			baseQb().andWhere('appt.isPaid = :p', { p: false }).getCount(),
			baseQb().andWhere('appt.paymentMethod = :m', { m: PaymentMethod.CASH }).getCount(),
			baseQb().andWhere('appt.paymentMethod = :m', { m: PaymentMethod.ONLINE }).getCount(),
		]);

		return {
			count: {
				totalAppointments,
				totalUniquePatientsCount: uniquePatients.length,
				totalUniqueDoctorsCount: uniqueDoctors.length,
				totalPendingAppointments: totalPending,
				totalConfirmedAppointments: totalConfirmed,
				totalRunningAppointments: totalRunning,
				totalCompletedAppointments: totalCompleted,
				totalCancelledAppointments: totalCancelled,
				totalPaidAppointments: totalPaid,
				totalUnPaidAppointments: totalUnpaid,
				totalCashPaidAppointments: totalCash,
				totalOnlinePaidAppointments: totalOnline,
			},
			message: 'Appointments count fetched successfully',
		};
	}

	async getTotalAppointmentsGraph(user: User) {
		const months = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December',
		];

		let rawQuery = `
			SELECT
				EXTRACT(YEAR FROM "date") AS year,
				EXTRACT(MONTH FROM "date") AS month,
				COUNT(*) AS total
			FROM "Appointment"
		`;
		const params: string[] = [];

		if (user.role === Role.DOCTOR) {
			rawQuery += ` WHERE "doctorId" = $1`;
			params.push(user.id);
		} else if (user.role === Role.PATIENT) {
			rawQuery += ` WHERE "patientId" = $1`;
			params.push(user.id);
		}

		rawQuery += ' GROUP BY year, month ORDER BY year, month';

		const raw = await this.appointmentRepo.query(rawQuery, params) as Array<{ year: string; month: string; total: string }>;

		return {
			result: raw.map((r) => ({
				year: Number(r.year),
				month: months[Number(r.month) - 1],
				total: Number(r.total),
			})),
			message: 'Appointments graph fetched successfully',
		};
	}

	async updateAppointment(dto: UpdateAppointmentDto, appointmentId: string, user: User) {
		const appointment = await this.appointmentRepo.findOne({ where: { id: appointmentId } });
		if (!appointment) throw new BadRequestException('Appointment not found');

		const updateData = await this.handler.prepareUpdate(dto, appointment, user.role);

		if (Object.keys(updateData).length) {
			await this.appointmentRepo.update({ id: appointmentId }, updateData);
		}

		return { message: 'Appointment updated successfully' };
	}

	private isUniqueConstraintError(error: unknown): boolean {
		return typeof error === 'object' && error !== null && 'code' in error &&
			(error as { code: string }).code === '23505';
	}
}
