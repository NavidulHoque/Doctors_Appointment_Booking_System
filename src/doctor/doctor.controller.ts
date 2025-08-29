import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, GetDoctorsDto, UpdateDoctorDto } from './dto';
import { UserDto } from 'src/user/dto';
import { Roles, User } from 'src/auth/decorators';
import { Role } from 'src/auth/enum';

@UseGuards(AuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {

    constructor(
        private doctorService: DoctorService
    ) { }

    @Post("/create-doctor")
    @Roles(Role.Admin)
    createDoctor(
        @Body() dto: CreateDoctorDto,
    ) {
        return this.doctorService.createDoctor(dto)
    }

    @Get("/get-all-doctors")
    @Roles(Role.Admin, Role.Patient)
    getAllDoctors(
        @Query() query: GetDoctorsDto
    ) {
        return this.doctorService.getAllDoctors(query)
    }

    @Get("/get-a-doctor/:id")
    @Roles(Role.Admin, Role.Patient)
    getADoctor(
        @Param('id') id: string,
        @Query() query: GetDoctorsDto,
    ) {
        return this.doctorService.getADoctor(id, query)
    }

    @Get("/get-total-revenue")
    @Roles(Role.Doctor)
    getTotalRevenue(
        @User() user: UserDto
    ) {
        return this.doctorService.getTotalRevenue(user)
    }

    @Patch("/update-doctor/:id")
    @Roles(Role.Doctor, Role.Admin)
    updateDoctor(
        @Body() body: UpdateDoctorDto,
        @Param('id') id: string
    ) {
        return this.doctorService.updateDoctor(body, id)
    }

    @Patch("/stripe/create-account")
    @Roles(Role.Doctor)
    createStripeAccount(
        @User("id") userId: string
    ) {
        return this.doctorService.createStripeAccount(userId)
    }
    
    @Patch("/stripe/activate-account")
    @Roles(Role.Doctor)
    activateStripeAccount(
        @User("id") userId: string,
        @Body("stripeAccountId") stripeAccountId: string
    ){
        return this.doctorService.activateStripeAccount(userId, stripeAccountId)
    }
    
    @Delete("/delete-doctor/:doctorId")
    @Roles(Role.Doctor, Role.Admin)
    deleteDoctor(
        @Param('doctorId') doctorId: string,
    ) {
        return this.doctorService.deleteDoctor(doctorId)
    }
}
