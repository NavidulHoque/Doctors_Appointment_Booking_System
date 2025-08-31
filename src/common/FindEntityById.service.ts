import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FindEntityByIdService {

    private readonly primaryKeys = {
        doctor: 'userId',
        user: 'id',
        appointment: 'id',
        review: "id",
        message: "id",
        notification: "id",
        payment: "id",
        session: "id"
    };

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async findEntityById(modelName: string, id: string, select: any | null) {
        const primaryKey = this.primaryKeys[modelName]

        if (!select) {

            const entity = await this.prisma[modelName].findUnique({ where: { [primaryKey]: id } })

            if (!entity) {
                throw new NotFoundException(`${modelName} not found`)
            }

            return
        }

        else if (select) {

            const entity = await this.prisma[modelName].findUnique({ 
                where: { [primaryKey]: id },
                select
            })

            if (!entity) {
                throw new NotFoundException(`${modelName} not found`)
            }

            return entity
        }
    }
}
