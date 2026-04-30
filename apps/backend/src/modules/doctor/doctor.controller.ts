import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DoctorService } from '@dab/backend/modules/doctor/doctor.service';
import { CreateDoctorDto } from '@dab/backend/modules/doctor/dtos/create-doctor.dto';
import { UpdateDoctorDto } from '@dab/backend/modules/doctor/dtos/update-doctor.dto';
import { GetDoctorsDto } from '@dab/backend/modules/doctor/dtos/query-doctor.dto';
import { PaginationDto } from '@dab/backend/common/dtos/pagination.dto';
import { Roles } from '@dab/backend/common/decorators/roles.decorator';
import { CurrentUser } from '@dab/backend/common/decorators/current-user.decorator';
import { Role } from '@dab/shared';
import type { User } from '@dab/database';

@ApiTags('doctors')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
@Controller('doctors')
export class DoctorController {
	constructor(private readonly doctorService: DoctorService) {}

	@Roles(Role.ADMIN)
	@Post()
	@ApiOperation({ summary: 'Admin: create a doctor account' })
	@ApiCreatedResponse({ description: 'Doctor account created successfully' })
	@ApiForbiddenResponse({ description: 'Admin role required' })
	createDoctor(@Body() dto: CreateDoctorDto) {
		return this.doctorService.createDoctor(dto);
	}

	@Get()
	@ApiOperation({ summary: 'Get all doctors with filters and pagination' })
	@ApiOkResponse({ description: 'Paginated list of doctors with ratings' })
	getAllDoctors(@Query() query: GetDoctorsDto) {
		return this.doctorService.getAllDoctors(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a single doctor with reviews and related doctors' })
	@ApiParam({ name: 'id', description: 'Doctor user UUID' })
	@ApiOkResponse({ description: 'Doctor profile, reviews, and related doctors returned' })
	@ApiNotFoundResponse({ description: 'Doctor not found' })
	getADoctor(@Param('id') id: string, @Query() query: PaginationDto) {
		return this.doctorService.getADoctor(id, query);
	}

	@Roles(Role.DOCTOR)
	@Post('stripe/account')
	@ApiOperation({ summary: 'Doctor: create Stripe Connect account' })
	@ApiCreatedResponse({ description: 'Stripe account created, onboarding URL returned' })
	@ApiForbiddenResponse({ description: 'Doctor role required' })
	createStripeAccount(@CurrentUser() user: User) {
		return this.doctorService.createStripeAccount(user.id);
	}

	@Roles(Role.DOCTOR)
	@Post('stripe/activate')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Doctor: activate Stripe Connect account after onboarding' })
	@ApiOkResponse({ description: 'Stripe account activated' })
	@ApiForbiddenResponse({ description: 'Doctor role required' })
	activateStripeAccount(@CurrentUser() user: User) {
		return this.doctorService.activateStripeAccount(user.id);
	}
}
