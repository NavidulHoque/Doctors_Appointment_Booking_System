import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '@dab/database';
import { AppointmentStatus, PaymentMethod, Role } from '@dab/shared';
import { NotificationService } from '@backend/modules/notification/notification.service';
import type { UpdateAppointmentDto } from '@backend/modules/appointment/dtos/update-appointment.dto';

@Injectable()
export class AppointmentHandler {
	private readonly logger = new Logger(AppointmentHandler.name);

	constructor(
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
		private readonly notificationService: NotificationService,
		private readonly schedulerRegistry: SchedulerRegistry,
	) {}

	async handleConfirm(appointment: Appointment, userRole: string) {
		if (userRole !== Role.ADMIN) throw new ForbiddenException('Only admins can confirm appointments');

		await this.appointmentRepo.update({ id: appointment.id }, { status: AppointmentStatus.CONFIRMED });

		const delay = new Date(appointment.date).getTime() - Date.now();
		if (delay > 0) {
			const timeoutId = setTimeout(async () => {
				try {
					await this.appointmentRepo.update({ id: appointment.id }, { status: AppointmentStatus.RUNNING });
					await this.notificationService.createNotification(
						appointment.patientId,
						`Your appointment is now running.`,
					);
					await this.notificationService.createNotification(
						appointment.doctorId,
						`Appointment is now in progress.`,
					);
				} catch (err) {
					this.logger.error(`Failed to auto-start appointment ${appointment.id}:`, err);
				}
			}, delay);

			this.schedulerRegistry.addTimeout(`start-appointment-${appointment.id}`, timeoutId);
		}

		return { status: AppointmentStatus.CONFIRMED };
	}

	async handleCancel(appointment: Appointment, dto: UpdateAppointmentDto, _userRole: string) {
		if (!dto.cancellationReason) {
			throw new BadRequestException('Cancellation reason is required');
		}

		const update: Partial<Appointment> = {
			status: AppointmentStatus.CANCELLED,
			cancellationReason: dto.cancellationReason,
		};

		// Cancel the scheduled start timeout if exists
		try {
			this.schedulerRegistry.deleteTimeout(`start-appointment-${appointment.id}`);
		} catch {
			// Timeout may not exist if appointment wasn't confirmed yet
		}

		return update;
	}

	async handleComplete(appointment: Appointment, userRole: string) {
		if (userRole !== Role.ADMIN) throw new ForbiddenException('Only admins can complete appointments');

		const update: Partial<Appointment> = { status: AppointmentStatus.COMPLETED };

		if (!appointment.isPaid) {
			update.paymentMethod = PaymentMethod.CASH;
			update.isPaid = true;
		}

		return update;
	}

	async handleRunning(appointment: Appointment, userRole: string) {
		if (userRole !== Role.ADMIN) throw new ForbiddenException('Only admins can mark appointments as running');

		if (appointment.status !== AppointmentStatus.CONFIRMED) {
			throw new BadRequestException('Only confirmed appointments can be marked as running');
		}

		return { status: AppointmentStatus.RUNNING };
	}

	async prepareUpdate(
		dto: UpdateAppointmentDto,
		appointment: Appointment,
		userRole: string,
	): Promise<Partial<Appointment>> {
		if (!dto.status) return {};

		switch (dto.status) {
			case AppointmentStatus.CONFIRMED:
				return this.handleConfirm(appointment, userRole);
			case AppointmentStatus.CANCELLED:
				return this.handleCancel(appointment, dto, userRole);
			case AppointmentStatus.COMPLETED:
				return this.handleComplete(appointment, userRole);
			case AppointmentStatus.RUNNING:
				return this.handleRunning(appointment, userRole);
			default:
				throw new BadRequestException(`Invalid status transition to ${dto.status}`);
		}
	}
}
