import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from './dto';
import { CheckRoleService } from 'src/common/checkRole.service';
import { Roles } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {

    constructor(
        private appointmentService: AppointmentService
    ) { }

    @Post("/create-appointment")
    @Roles(Role.Admin, Role.Patient)
    createAppointment(
        @Body() dto: CreateAppointmentDto,
    ) {
        return this.appointmentService.createAppointment(dto)
    }

    @Get("/get-all-appointments")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    getAllAppointments(
        @Query() query: GetAppointmentsDto
    ) {
        return this.appointmentService.getAllAppointments(query)
    }

    @Get("/get-all-appointments-count")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    getAllAppointmentCount(
        @Query() query: GetAppointmentsDto
    ) {
        return this.appointmentService.getAllAppointmentCount(query)
    }

    @Get("/get-an-appointment/:id")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    getAnAppointment(
        @Param('id') id: string,
    ) {
        return this.appointmentService.getAnAppointment(id)
    }

    @Get("/get-total-appointments-graph")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    getTotalAppointmentsGraph(
        @Query() query: GetAppointmentsDto
    ) {
        return this.appointmentService.getTotalAppointmentsGraph(query)
    }

    @Patch("/update-appointment/:id")
    @Roles(Role.Admin, Role.Patient, Role.Doctor)
    updateAppointment(
        @Body() dto: UpdateAppointmentDto, 
        @Param('id') id: string,
    ) {
        return this.appointmentService.updateAppointment(dto, id)
    }
}
