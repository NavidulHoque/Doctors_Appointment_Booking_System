import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, GetDoctorsDto, UpdateDoctorDto } from './dto';
import { UserDto } from 'src/user/dto';
import { Roles, User } from 'src/auth/decorators';
import { Role } from '@prisma/client';
import { EntityByIdPipe } from 'src/common/pipes';
import { doctorSelect } from 'src/prisma/prisma-selects';
import { DoctorProducerService } from './doctor.producer.service';
import { RequestWithTrace } from 'src/common/types';
import { Cache } from 'src/common/decorators';

@UseGuards(AuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {

    constructor(
        private readonly doctorService: DoctorService,
        private readonly doctorProducerService: DoctorProducerService
    ) { }

    @Post("/create-doctor")
    @Roles(Role.ADMIN)
    @Cache({
        enabled: true,
        invalidate: "cache:GET:/doctors:*"
    })
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
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: "cache:GET:/doctors:*"
    })
    updateDoctor(
        @Body() dto: UpdateDoctorDto,
        @Param('id', EntityByIdPipe('doctor', { id: true })) { id: doctorId }: Record<string, string>,
        @Req() request: RequestWithTrace,
    ) {
        const traceId = request.traceId
        const data = {
            ...dto,
            userId: doctorId
        }

        return this.doctorProducerService.sendUpdateDoctor(data, traceId)
    }

    @Patch("/stripe/create-account/:id")
    @Roles(Role.DOCTOR)
    @HttpCode(202)
    createStripeAccount(
        @Param('id', EntityByIdPipe('doctor', {
            user: {
                select: {
                    id: true,
                    email: true
                }
            },
            stripeAccountId: true
        })) doctor: Record<string, any>,
        @Req() request: RequestWithTrace,
    ) {
        const traceId = request.traceId
        const data = {
            userId: doctor.user.id,
            doctor
        }
        return this.doctorProducerService.sendCreateStripeAccount(data, traceId)
    }

    @Patch("/stripe/activate-account")
    @Roles(Role.DOCTOR)
    @HttpCode(202)
    activateStripeAccount(
        @User("id") userId: string,
        @Body("stripeAccountId") stripeAccountId: string,
        @Req() request: RequestWithTrace,
    ) {
        const traceId = request.traceId
        const data = {
            userId,
            stripeAccountId
        }
        return this.doctorProducerService.sendActivateStripeAccount(data, traceId)
    }

    @Delete("/delete-doctor/:id")
    @Roles(Role.DOCTOR, Role.ADMIN)
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: "cache:GET:/doctors:*"
    })
    deleteDoctor(
        @Param('id', EntityByIdPipe('doctor', { id: true })) { id: doctorId }: Record<string, string>,
        @Req() request: RequestWithTrace
    ) {
        const traceId = request.traceId
        const data = {
            userId: doctorId
        }
        return this.doctorProducerService.sendDeleteDoctor(data, traceId)
    }
}
