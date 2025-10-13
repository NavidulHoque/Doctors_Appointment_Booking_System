import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Injectable()
export class HandleErrorsService {
    handleUniqueConstraintError(error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            const target = error.meta?.target;
            const fields = Array.isArray(target) ? target.join(', ') : String(target);
            throw new ConflictException(`${fields} already exists`);
        }

        throw error;
    }
}