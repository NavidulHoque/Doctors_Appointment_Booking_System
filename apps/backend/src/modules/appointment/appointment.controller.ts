import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppointmentService } from '@dab/backend/modules/appointment/appointment.service';
import { CreateAppointmentDto } from '@dab/backend/modules/appointment/dtos/create-appointment.dto';
import { UpdateAppointmentDto } from '@dab/backend/modules/appointment/dtos/update-appointment.dto';
import { GetAppointmentsDto } from '@dab/backend/modules/appointment/dtos/query-appointment.dto';
import { CurrentUser } from '@dab/backend/common/decorators/current-user.decorator';
import type { User } from '@dab/database';
import { CreateAppointmentResponseDto } from '@dab/backend/modules/appointment/dtos/response/create-appointment-response.dto';
import { Roles } from '@dab/backend/common/decorators/roles.decorator';
import { Role } from '@dab/shared';

@ApiTags('appointments')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@Controller('appointments')
export class AppointmentController {
	constructor(private readonly appointmentService: AppointmentService) { }

	@Post()
	@Roles(Role.PATIENT, Role.ADMIN)
	@ApiOperation({ summary: 'Create a new appointment' })
	@ApiCreatedResponse({
		type: CreateAppointmentResponseDto,
		description: 'Appointment created successfully'
	})
	@ApiNotFoundResponse({ description: 'Patient or Doctor not found' })
	@ApiBadRequestResponse({ description: 'Invalid roles or Appointment already exists for this date' })
	@ApiForbiddenResponse({ description: 'You are not authorized to perform this action' })
	@ApiConflictResponse({ description: 'Appointment already exists for this date' })
	createAppointment(@Body() dto: CreateAppointmentDto) {
		return this.appointmentService.createAppointment(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all appointments (results scoped by role)' })
	@ApiOkResponse({ description: 'Paginated list of appointments' })
	getAllAppointments(@Query() query: GetAppointmentsDto, @CurrentUser() user: User) {
		return this.appointmentService.getAllAppointments(query, user);
	}

	@Get('counts')
	@ApiOperation({ summary: 'Get appointment status counts (scoped by role)' })
	@ApiOkResponse({ description: 'Counts by status returned' })
	getAllAppointmentCount(@CurrentUser() user: User) {
		return this.appointmentService.getAllAppointmentCount(user);
	}

	@Get('graph')
	@ApiOperation({ summary: 'Get monthly appointment graph data' })
	@ApiOkResponse({ description: 'Monthly appointment totals returned' })
	getGraph(@CurrentUser() user: User) {
		return this.appointmentService.getTotalAppointmentsGraph(user);
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Update appointment status or cancellation reason' })
	@ApiParam({ name: 'id', description: 'Appointment UUID' })
	@ApiOkResponse({ description: 'Appointment updated successfully' })
	@ApiNotFoundResponse({ description: 'Appointment not found' })
	@ApiForbiddenResponse({ description: 'Not authorised to update this appointment' })
	updateAppointment(
		@Param('id') id: string,
		@Body() dto: UpdateAppointmentDto,
		@CurrentUser() user: User,
	) {
		return this.appointmentService.updateAppointment(dto, id, user);
	}
}
