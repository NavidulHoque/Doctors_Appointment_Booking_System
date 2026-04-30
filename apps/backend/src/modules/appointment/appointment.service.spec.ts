import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Appointment } from '@dab/database';
import { AppointmentService } from '@dab/backend/modules/appointment/appointment.service';
import { NotificationService } from '@dab/backend/modules/notification/notification.service';
import { EnvService } from '@dab/backend/modules/config/env.service';
import { AppointmentHandler } from '@dab/backend/modules/appointment/handlers/appointment.handler';

const mockRepo = () => ({
	findOne: jest.fn(),
	create: jest.fn(),
	save: jest.fn(),
	update: jest.fn(),
	createQueryBuilder: jest.fn(),
	query: jest.fn(),
});

const mockNotification = () => ({ sendNotification: jest.fn().mockResolvedValue(undefined) });
const mockEnv = () => ({ adminId: 'admin1' });
const mockHandler = () => ({ prepareUpdate: jest.fn().mockResolvedValue({}) });

const patient = { id: 'p1', role: 'PATIENT', fullName: 'Alice' } as User;
const doctor = { id: 'd1', role: 'DOCTOR', fullName: 'Dr. Bob' } as User;
const appointment = { id: 'appt1', patientId: 'p1', doctorId: 'd1', date: new Date() } as Appointment;

describe('AppointmentService', () => {
	let service: AppointmentService;
	let userRepo: ReturnType<typeof mockRepo>;
	let appointmentRepo: ReturnType<typeof mockRepo>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				AppointmentService,
				{ provide: getRepositoryToken(User), useFactory: mockRepo },
				{ provide: getRepositoryToken(Appointment), useFactory: mockRepo },
				{ provide: NotificationService, useFactory: mockNotification },
				{ provide: EnvService, useFactory: mockEnv },
				{ provide: AppointmentHandler, useFactory: mockHandler },
			],
		}).compile();
		service = module.get(AppointmentService);
		userRepo = module.get(getRepositoryToken(User));
		appointmentRepo = module.get(getRepositoryToken(Appointment));
	});

	describe('createAppointment', () => {
		it('creates an appointment successfully', async () => {
			userRepo.findOne.mockResolvedValueOnce(patient).mockResolvedValueOnce(doctor);
			appointmentRepo.create.mockReturnValue(appointment);
			appointmentRepo.save.mockResolvedValue(appointment);

			const result = await service.createAppointment({ patientId: 'p1', doctorId: 'd1', date: new Date().toISOString() });
			expect(result.message).toBe('Appointment created successfully');
		});

		it('throws BadRequestException when patient or doctor not found', async () => {
			userRepo.findOne.mockResolvedValue(null);
			await expect(service.createAppointment({ patientId: 'p1', doctorId: 'd1', date: new Date().toISOString() })).rejects.toThrow(BadRequestException);
		});

		it('throws BadRequestException for invalid roles', async () => {
			userRepo.findOne.mockResolvedValueOnce({ ...patient, role: 'DOCTOR' }).mockResolvedValueOnce(doctor);
			await expect(service.createAppointment({ patientId: 'p1', doctorId: 'd1', date: new Date().toISOString() })).rejects.toThrow(BadRequestException);
		});

		it('throws BadRequestException on unique constraint violation', async () => {
			userRepo.findOne.mockResolvedValueOnce(patient).mockResolvedValueOnce(doctor);
			appointmentRepo.create.mockReturnValue(appointment);
			appointmentRepo.save.mockRejectedValue({ code: '23505' });
			await expect(service.createAppointment({ patientId: 'p1', doctorId: 'd1', date: new Date().toISOString() })).rejects.toThrow(BadRequestException);
		});
	});

	describe('updateAppointment', () => {
		it('updates appointment successfully', async () => {
			appointmentRepo.findOne.mockResolvedValue(appointment);
			appointmentRepo.update.mockResolvedValue(undefined);
			const result = await service.updateAppointment({}, 'appt1', { ...patient, role: 'PATIENT' } as User);
			expect(result.message).toBe('Appointment updated successfully');
		});

		it('throws BadRequestException when appointment not found', async () => {
			appointmentRepo.findOne.mockResolvedValue(null);
			await expect(service.updateAppointment({}, 'appt1', patient)).rejects.toThrow(BadRequestException);
		});
	});
});
