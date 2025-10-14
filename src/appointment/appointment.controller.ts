import {
    Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CsrfGuard, AuthGuard, RolesGuard } from 'src/auth/guards';
import { CreateAppointmentDto, GetAppointmentsDto, UpdateAppointmentDto} from './dtos';
import { Roles, User } from 'src/auth/decorators';
import { Role } from '@prisma/client';
import { EntityByIdPipe } from 'src/common/pipes';
import { appointmentSelect } from './prisma-selects';
import { RequestWithTrace } from 'src/common/types';
import { Cache } from 'src/common/decorators';
import { CacheKeyHelper } from './helpers';
import { UserDto } from 'src/user/dtos';
import { AppointmentWithUser } from './types';

@UseGuards(CsrfGuard, AuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) { }

    @Post()
    @Roles(Role.ADMIN, Role.PATIENT)
    @Cache({
        enabled: true,
        invalidate: 'cache:GET:/appointments:*',
    })
    createAppointment(
        @Body() dto: CreateAppointmentDto,
        @Req() request: RequestWithTrace,
        @User() user: UserDto
    ) {
        dto.patientId = user.role === Role.PATIENT ? user.id : dto.patientId
        return this.appointmentService.createAppointment(dto, request.traceId);
    }

    @Get()
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @Cache({
        enabled: true,
        ttl: 60,
        key: CacheKeyHelper.generateAppointmentsKey,
    })
    getAllAppointments(
        @Query() query: GetAppointmentsDto,
        @User() user: UserDto
    ) {
        return this.appointmentService.getAllAppointments(query, user);
    }

    @Get('count')
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    getAllAppointmentCount(
        @User() user: UserDto
    ) {
        return this.appointmentService.getAllAppointmentCount(user);
    }

    @Get('graph/total')
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    getTotalAppointmentsGraph(@User() user: UserDto) {
        return this.appointmentService.getTotalAppointmentsGraph(user);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.PATIENT, Role.DOCTOR)
    @Cache({
        enabled: true,
        invalidate: 'cache:GET:/appointments:*',
    })
    updateAppointment(
        @Body() dto: UpdateAppointmentDto,
        @Param('id', EntityByIdPipe('appointment', appointmentSelect))
        appointment: AppointmentWithUser,
        @Req() request: RequestWithTrace,
        @User("role") userRole: string
    ) {
        return this.appointmentService.updateAppointment(
            dto,
            request.traceId,
            appointment,
            userRole
        );
    }
}
