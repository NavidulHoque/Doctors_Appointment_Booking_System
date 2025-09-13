import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, GetDoctorsDto, UpdateDoctorDto } from './dto';
import { Roles, User } from 'src/auth/decorators';
import { Prisma, Role } from '@prisma/client';
import { EntityByIdPipe } from 'src/common/pipes';
import { doctorSelect } from 'src/prisma/prisma-selects';
import { DoctorProducerService } from './doctor.producer.service';
import { RequestWithTrace } from 'src/common/types';
import { Cache } from 'src/common/decorators';
import { CacheKeyHelper } from './helper';
import { UserDto } from 'src/user/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {

    constructor(
        private readonly doctorService: DoctorService,
        private readonly doctorProducerService: DoctorProducerService,
        private readonly prisma: PrismaService
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
    @Cache({
        enabled: true,
        ttl: 60,
        key: CacheKeyHelper.generateDoctorsKey
    })
    getAllDoctors(
        @Query() query: GetDoctorsDto
    ) {
        return this.doctorService.getAllDoctors(query)
    }

    @Get("/get-a-doctor/:id")
    @Roles(Role.ADMIN, Role.PATIENT)
    getADoctor(
        @Param('id', EntityByIdPipe('doctor', doctorSelect)) doctor: Record<string, any>,
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
        @User() user: UserDto
    ) {
        const traceId = request.traceId
        const data = {
            ...dto,
            userId: user.id,
            doctorId: user.role === Role.DOCTOR ? user.id : doctorId
        }

        return this.doctorProducerService.sendUpdateDoctor(data, traceId)
    }

    @Patch("/stripe/create-account")
    @Roles(Role.DOCTOR)
    @HttpCode(202)
    async createStripeAccount(
        @Req() request: RequestWithTrace,
        @User("id") doctorId: string
    ) {
        const traceId = request.traceId

        const doctor = await this.fetchDoctor(doctorId, {
            user: {
                select: {
                    id: true,
                    email: true
                }
            },
            stripeAccountId: true
        })

        const data = {
            userId: doctor!.user.id,
            doctor
        }

        return this.doctorProducerService.sendCreateStripeAccount(data, traceId)
    }

    @Patch("/stripe/activate-account")
    @Roles(Role.DOCTOR)
    @HttpCode(202)
    async activateStripeAccount(
        @User("id") userId: string,
        @Req() request: RequestWithTrace,
    ) {
        const traceId = request.traceId

        const doctor = await this.fetchDoctor(userId, {
            stripeAccountId: true
        })

        const data = {
            userId,
            stripeAccountId: doctor!.stripeAccountId
        }

        return this.doctorProducerService.sendActivateStripeAccount(data, traceId)
    }

    @Delete("/delete-doctor/:id")
    @Roles(Role.ADMIN)
    @HttpCode(202)
    @Cache({
        enabled: true,
        invalidate: "cache:GET:/doctors:*"
    })
    deleteDoctor(
        @Param('id', EntityByIdPipe('doctor', { id: true })) { id: doctorId }: Record<string, string>,
        @Req() request: RequestWithTrace,
        @User("id") adminId: string
    ) {
        const traceId = request.traceId
        const data = {
            userId: adminId,
            doctorId
        }
        return this.doctorProducerService.sendDeleteDoctor(data, traceId)
    }

    private async fetchDoctor(doctorId: string, select: Prisma.DoctorSelect) {
        return await this.prisma.doctor.findUnique({
            where: { userId: doctorId },
            select
        })
    }
}
