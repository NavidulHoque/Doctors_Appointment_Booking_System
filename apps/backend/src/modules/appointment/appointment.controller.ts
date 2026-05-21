import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
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
import { AppointmentStatus, Role } from '@dab/shared';
import { AppointmentCountResponseDto } from '@dab/backend/modules/appointment/dtos/response/appointment-count-response.dto';
import { AppointmentGraphResponseDto } from '@dab/backend/modules/appointment/dtos/response/appointment-graph-response.dto';
import { MessageResponseDto } from '@dab/backend/common/dtos/response/message-response.dto';
import { AppointmentResponseDto } from './dtos/response/appointment-response.dto';
import { SwaggerPaginatedDto } from '@dab/backend/common/dtos/response/swagger-paginated.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
@ApiInternalServerErrorResponse({ description: 'Internal server error' })
@Controller('appointments')
export class AppointmentController {
	constructor(private readonly appointmentService: AppointmentService) { }

	@Roles(Role.PATIENT, Role.ADMIN)
	@Post()
	@ApiOperation({ summary: 'Create a new appointment' })
	@ApiCreatedResponse({
		type: CreateAppointmentResponseDto,
		description: 'Appointment created successfully'
	})
	@ApiNotFoundResponse({ description: 'Patient or Doctor not found' })
	@ApiBadRequestResponse({ description: 'Invalid roles' })
	@ApiForbiddenResponse({ description: 'You are not authorized to perform this action' })
	@ApiConflictResponse({ description: 'Appointment already exists for this date' })
	createAppointment(@Body() dto: CreateAppointmentDto) {
		return this.appointmentService.createAppointment(dto);
	}

	@Roles(Role.PATIENT, Role.ADMIN, Role.DOCTOR)
	@Get()
	@ApiOperation({ summary: 'Get all appointments' })
	@ApiQuery({ name: 'page', required: true, type: Number })
	@ApiQuery({ name: 'limit', required: true, type: Number })
	@ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
	@ApiQuery({ name: 'search', required: false, type: String })
	@ApiQuery({ name: 'isToday', required: false, type: Boolean })
	@ApiQuery({ name: 'isPast', required: false, type: Boolean })
	@ApiQuery({ name: 'isFuture', required: false, type: Boolean })
	@ApiOkResponse({ 
		type:  SwaggerPaginatedDto(AppointmentResponseDto),
		description: 'Paginated list of appointments' 
	})
	getAllAppointments(@Query() query: GetAppointmentsDto, @CurrentUser() user: User) {
		return this.appointmentService.getAllAppointments(query, user);
	}

	@Roles(Role.PATIENT, Role.ADMIN, Role.DOCTOR)
	@Get('counts')
	@ApiOperation({ summary: 'Get appointment counts' })
	@ApiOkResponse({ 
		type: AppointmentCountResponseDto,
		description: 'Appointments count fetched successfully' 
	})
	getAllAppointmentCount(@CurrentUser() user: User) {
		return this.appointmentService.getAllAppointmentCount(user);
	}

	@Roles(Role.PATIENT, Role.ADMIN, Role.DOCTOR)
	@Get('graph')
	@ApiOperation({ summary: 'Get monthly appointment graph data' })
	@ApiOkResponse({ 
		type: AppointmentGraphResponseDto,
		description: 'Appointments graph fetched successfully' 
	})
	getGraph(@CurrentUser() user: User) {
		return this.appointmentService.getTotalAppointmentsGraph(user);
	}

	@Roles(Role.PATIENT, Role.ADMIN, Role.DOCTOR)
	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Update appointment status or cancellation reason' })
	@ApiParam({ name: 'id', description: 'Appointment UUID' })
	@ApiOkResponse({ 
		type: MessageResponseDto,
		description: 'Appointment updated successfully' 
	})
	@ApiBadRequestResponse({ description: 'Cancellation reason is required when cancelling' })
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
