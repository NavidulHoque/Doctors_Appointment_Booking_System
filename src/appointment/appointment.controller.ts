import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from './dto';
import { Roles, User } from 'src/auth/decorators';
import { Role } from '@prisma/client';
import { EntityByIdPipe } from 'src/common/pipes';
import { appointmentSelect } from 'src/prisma/prisma-selects';
import { RequestWithTrace } from 'src/common/types';
import { AppointmentProducerService } from './appointment.producer.service';
import { Cache } from 'src/common/decorators';
import { CacheKeyHelper } from './helper';

@UseGuards(AuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {

    constructor(
        private readonly appointmentService: AppointmentService,
        private readonly appointmentProducerService: AppointmentProducerService
    ) { }

    @Post("/create-appointment")
    @Roles(Role.ADMIN, Role.PATIENT)
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: "cache:GET:/appointments:*"
    })
    createAppointment(
        @Body() dto: CreateAppointmentDto,
        @Req() request: RequestWithTrace,
        @User("id") userId: string
    ) {
        const traceId = request.traceId;
        const data = {
            ...dto,
            userId
        }

        return this.appointmentProducerService.sendCreateAppointment(data, traceId)
    }

    @Get("/get-all-appointments")
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @Cache({
        enabled: true,
        ttl: 60,
        key: CacheKeyHelper.generateAppointmentsKey
    })
    getAllAppointments(
        @Query() query: GetAppointmentsDto
    ) {
        return this.appointmentService.getAllAppointments(query)
    }

    @Get("/get-all-appointments-count")
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    getAllAppointmentCount(
        @Query() query: GetAppointmentsDto
    ) {
        return this.appointmentService.getAllAppointmentCount(query)
    }

    @Get("/get-an-appointment/:id")
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    getAnAppointment(
        @Param('id', EntityByIdPipe('appointment', appointmentSelect)) appointment: any,
    ) {
        return {
            data: appointment,
            message: "Appointment fetched successfully"
        }
    }

    @Get("/get-total-appointments-graph")
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    getTotalAppointmentsGraph(
        @Query() query: GetAppointmentsDto
    ) {
        return this.appointmentService.getTotalAppointmentsGraph(query)
    }

    @Patch("/update-appointment/:id")
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: "cache:GET:/appointments:*"
    })
    updateAppointment(
        @Body() dto: UpdateAppointmentDto,
        @Param('id', EntityByIdPipe('appointment', appointmentSelect)) appointment: Record<string, any>,
        @Req() request: RequestWithTrace,
        @User("id") userId: string
    ) {
        const traceId = request.traceId;
        const data = {
            ...dto,
            userId,
            appointment
        }

        return this.appointmentProducerService.sendUpdateAppointment(data, traceId)
    }
}
