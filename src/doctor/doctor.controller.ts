import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, CsrfGuard, RolesGuard } from 'src/auth/guards';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto, GetDoctorsDto, UpdateDoctorDto } from './dtos';
import { Roles, User } from 'src/auth/decorators';
import { Prisma, Role } from '@prisma/client';
import { EntityByIdPipe } from 'src/common/pipes';
import { doctorSelect } from './prisma-selects';
import { RequestWithTrace } from 'src/common/types';
import { Cache } from 'src/common/decorators';
import { CacheKeyHelper } from './helpers';
import { UserDto } from 'src/user/dtos';
import { PrismaService } from 'src/prisma';
import { PaginationDto } from 'src/common/dtos';

@UseGuards(CsrfGuard, AuthGuard, RolesGuard)
@Controller('doctors')
export class DoctorController {

    constructor(
        private readonly doctorService: DoctorService,
        private readonly prisma: PrismaService
    ) { }

    @Post()
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

    @Get()
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

    @Get(":id")
    @Roles(Role.ADMIN, Role.PATIENT)
    getADoctor(
        @Param('id', EntityByIdPipe('doctor', doctorSelect)) doctor: Record<string, any>,
        @Query() query: PaginationDto,
    ) {
        return this.doctorService.getADoctor(doctor, query)
    }

    @Patch(":id")
    @Roles(Role.DOCTOR, Role.ADMIN)
    @Cache({
        enabled: true,
        invalidate: "cache:GET:/doctors:*"
    })
    updateDoctor(
        @Body() dto: UpdateDoctorDto,
        @User() user: UserDto,
        @Param('id') id: string,
    ) {
        const doctorId = user.role === Role.DOCTOR ? user.id : id;
        return this.doctorService.updateDoctor(dto, doctorId);
    }

    @Patch("/stripe/create-account")
    @Roles(Role.DOCTOR)
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

        return this.doctorService.createStripeAccount(data, traceId)
    }

    @Patch("/stripe/activate-account")
    @Roles(Role.DOCTOR)
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

        return this.doctorService.activateStripeAccount(data, traceId)
    }

    @Delete(":id")
    @Roles(Role.ADMIN)
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
        return this.doctorService.deleteDoctor(data, traceId)
    }

    private async fetchDoctor(doctorId: string, select: Prisma.DoctorSelect) {
        return await this.prisma.doctor.findUnique({
            where: { userId: doctorId },
            select
        })
    }
}
