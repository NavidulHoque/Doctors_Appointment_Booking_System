import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from 'src/auth/guard';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto } from './dto';
import { CheckRoleService } from 'src/common/checkRole.service';
import { User } from 'src/user/decorator';
import { UserDto } from 'src/user/dto';

@UseGuards(AuthGuard)
@Controller('appointments')
export class AppointmentController {

    constructor(
        private appointmentService: AppointmentService,
        private checkRoleService: CheckRoleService
    ) { }

    @Post("/create-appointment")
    createAppointment(
        @Body() dto: CreateAppointmentDto,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatient(user.role)
        return this.appointmentService.createAppointment(dto)
    }

    @Get("/get-all-appointments")
    getAllAppointments(
        @User() user: UserDto,
        @Query() query: GetAppointmentsDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.appointmentService.getAllAppointments(query)
    }

    @Get("/get-all-appointments-count")
    getAllAppointmentCount(
        @User() user: UserDto,
        @Query() query: GetAppointmentsDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.appointmentService.getAllAppointmentCount(query)
    }

    @Get("/get-an-appointment/:id")
    getAnAppointment(
        @Param('id') id: string,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.appointmentService.getAnAppointment(id)
    }

    @Get("/get-total-appointments-graph")
    getTotalAppointmentsGraph(
        @User() user: UserDto,
        @Query() query: GetAppointmentsDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.appointmentService.getTotalAppointmentsGraph(query)
    }

    @Patch("/update-appointment/:id")
    updateAppointment(
        @Body() dto: UpdateAppointmentDto, 
        @Param('id') id: string,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrPatientOrDoctor(user.role)
        return this.appointmentService.updateAppointment(dto, id)
    }
}
