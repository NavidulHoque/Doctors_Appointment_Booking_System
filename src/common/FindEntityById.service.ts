import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HandleErrorsService } from './handleErrors.service';

@Injectable()
export class FindEntityByIdService {

    private readonly primaryKeys = {
        doctor: 'userId',
        user: 'id',
        appointment: 'id',
        review: "id",
        message: "id",
        notification: "id",
        payment: "id"
    };

    constructor(
        private readonly prisma: PrismaService,
        private readonly handleErrorsService: HandleErrorsService
    ) { }

    async findEntityById(modelName: string, id: string, select: any | null) {
        const primaryKey = this.primaryKeys[modelName]

        if (!select) {

            const entity = await this.prisma[modelName].findUnique({ where: { [primaryKey]: id } })

            if (!entity) {
                this.handleErrorsService.throwNotFoundError(`${modelName} not found`)
            }

            return
        }

        else if (select) {

            const entity = await this.prisma[modelName].findUnique({ 
                where: { [primaryKey]: id },
                select
            })

            if (!entity) {
                this.handleErrorsService.throwNotFoundError(`${modelName} not found`)
            }

            return entity
        }
    }
}
