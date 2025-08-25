import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, GetDoctorsDto, UpdateDoctorDto } from './dto';
import { CheckRoleService } from 'src/common/checkRole.service';
import { User } from 'src/user/decorator';
import { UserDto } from 'src/user/dto';

@UseGuards(AuthGuard)
@Controller('doctors')
export class DoctorController {

    constructor(
        private doctorService: DoctorService,
        private checkRoleService: CheckRoleService
    ) { }

    @Post("/create-doctor")
    createDoctor(
        @Body() dto: CreateDoctorDto,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdmin(user.role)
        return this.doctorService.createDoctor(dto)
    }

    @Get("/get-all-doctors")
    getAllDoctors(
        @User() user: UserDto,
        @Query() query: GetDoctorsDto
    ) {
        this.checkRoleService.checkIsAdminOrPatient(user.role)
        return this.doctorService.getAllDoctors(query)
    }

    @Get("/get-a-doctor/:id")
    getADoctor(
        @Param('id') id: string,
        @User() user: UserDto,
        @Query() query: GetDoctorsDto,
    ) {
        this.checkRoleService.checkIsAdminOrPatient(user.role)
        return this.doctorService.getADoctor(id, query)
    }

    @Get("/get-total-revenue")
    getTotalRevenue(
        @User() user: UserDto,
    ) {
        this.checkRoleService.checkIsDoctor(user.role)
        return this.doctorService.getTotalRevenue(user)
    }

    @Patch("/update-doctor/:id")
    updateDoctor(
        @Body() body: UpdateDoctorDto,
        @Param('id') id: string,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrDoctor(user.role)
        return this.doctorService.updateDoctor(body, id)
    }

    @Patch("/stripe/create-account")
    createStripeAccount(
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsDoctor(user.role)
        return this.doctorService.createStripeAccount(user.id)
    }
    
    @Patch("/stripe/activate-account")
    activateStripeAccount(
        @User() user: UserDto,
        @Body("stripeAccountId") stripeAccountId: string
    ){
        this.checkRoleService.checkIsDoctor(user.role)
        return this.doctorService.activateStripeAccount(user.id, stripeAccountId)
    }
    
    @Delete("/delete-doctor/:id")
    deleteDoctor(
        @Param('id') id: string,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsAdminOrDoctor(user.role)
        return this.doctorService.deleteDoctor(id)
    }
}
