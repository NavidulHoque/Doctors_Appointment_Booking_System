import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Role } from '@dab/shared';
import type { User } from '@dab/database';
import type { GetAppointmentsDto } from '@dab/backend/modules/appointment/dtos/query-appointment.dto';

const TZ = 'Asia/Dhaka';

@Injectable()
export class AppointmentHelper {
	buildWhereConditions(
		query: GetAppointmentsDto,
		user: User,
	): { where: Record<string, unknown>; orderBy: Record<string, string> } {
		const where: Record<string, unknown> = {};
		this.applyRoleScope(user, where);

		if (query.status) where['status'] = query.status;

		if (query.date) {
			where['date'] = new Date(query.date);
		} else if (query.isToday) {
			const today = DateTime.now().setZone(TZ);
			where['dateFrom'] = today.startOf('day').toJSDate();
			where['dateTo'] = today.endOf('day').toJSDate();
		} else if (query.isPast) {
			where['dateTo'] = DateTime.now().setZone(TZ).toJSDate();
		} else if (query.isFuture) {
			where['dateFrom'] = DateTime.now().setZone(TZ).toJSDate();
		}

		if (query.search) {
			where['search'] = query.search.toLowerCase();
		}

		return { where, orderBy: { date: 'DESC' } };
	}

	applyRoleScope(user: User, where: Record<string, unknown>): void {
		if (user.role === Role.PATIENT) {
			where['patientId'] = user.id;
		} else if (user.role === Role.DOCTOR) {
			where['doctorId'] = user.id;
		}
		// ADMIN sees all appointments
	}
}
