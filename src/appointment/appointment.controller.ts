import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from './dto';
import { Roles } from 'src/auth/decorators';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {

    constructor(
        private appointmentService: AppointmentService
    ) { }

    @Post("/create-appointment")
    @Roles(Role.ADMIN, Role.PATIENT)
    createAppointment(
        @Body() dto: CreateAppointmentDto,
    ) {
        return this.appointmentService.createAppointment(dto)
    }

    @Get("/get-all-appointments")
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
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
        @Param('id') id: string,
    ) {
        return this.appointmentService.getAnAppointment(id)
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
    updateAppointment(
        @Body() dto: UpdateAppointmentDto, 
        @Param('id') id: string,
    ) {
        return this.appointmentService.updateAppointment(dto, id)
    }
}
