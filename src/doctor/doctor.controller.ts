import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, GetDoctorsDto, UpdateDoctorDto } from './dto';
import { UserDto } from 'src/user/dto';
import { Roles, User } from 'src/auth/decorators';
import { Role } from '@prisma/client';
import { EntityByIdPipe } from 'src/common/pipes';
import { doctorSelect } from 'src/prisma/prisma-selects';

@UseGuards(AuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {

    constructor(
        private doctorService: DoctorService
    ) { }

    @Post("/create-doctor")
    @Roles(Role.ADMIN)
    createDoctor(
        @Body() dto: CreateDoctorDto,
    ) {
        return this.doctorService.createDoctor(dto)
    }

    @Get("/get-all-doctors")
    @Roles(Role.ADMIN, Role.PATIENT)
    getAllDoctors(
        @Query() query: GetDoctorsDto
    ) {
        return this.doctorService.getAllDoctors(query)
    }

    @Get("/get-a-doctor/:id")
    @Roles(Role.ADMIN, Role.PATIENT)
    getADoctor(
        @Param('id', EntityByIdPipe('doctor', doctorSelect)) doctor: any,
        @Query() query: GetDoctorsDto,
    ) {
        return this.doctorService.getADoctor(doctor, query)
    }

    @Get("/get-total-revenue")
    @Roles(Role.DOCTOR)
    getTotalRevenue(
        @User() user: UserDto
    ) {
        return this.doctorService.getTotalRevenue(user)
    }

    @Patch("/update-doctor/:id")
    @Roles(Role.DOCTOR, Role.ADMIN)
    updateDoctor(
        @Body() body: UpdateDoctorDto,
        @Param('id', EntityByIdPipe('doctor', { id: true })) { id: doctorId }: any,
    ) {
        return this.doctorService.updateDoctor(body, doctorId)
    }

    @Patch("/stripe/create-account")
    @Roles(Role.DOCTOR)
    createStripeAccount(
        @User("id") userId: string
    ) {
        return this.doctorService.createStripeAccount(userId)
    }

    @Patch("/stripe/activate-account")
    @Roles(Role.DOCTOR)
    activateStripeAccount(
        @User("id") userId: string,
        @Body("stripeAccountId") stripeAccountId: string
    ) {
        return this.doctorService.activateStripeAccount(userId, stripeAccountId)
    }

    @Delete("/delete-doctor/:id")
    @Roles(Role.DOCTOR, Role.ADMIN)
    deleteDoctor(
        @Param('id', EntityByIdPipe('doctor', { id: true })) { id: doctorId }: any,
    ) {
        return this.doctorService.deleteDoctor(doctorId)
    }
}
