import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class HandleErrorsService {

    handleError(error: any) {
        if (error instanceof BadRequestException ||
            error instanceof NotFoundException ||
            error instanceof UnauthorizedException ||
            error instanceof ForbiddenException ||
            error instanceof ConflictException) {

            throw error; // nest js will throw the correct error
        }

        throw new InternalServerErrorException(error.message);
    }

    throwBadRequestError(message: string | string[]) {
        throw new BadRequestException(message, {
            cause: new Error(),
            description: 'Your requested data is not valid',
        });
    }

    throwUnauthorizedError(message: string) {
        throw new UnauthorizedException(message, {
            cause: new Error(),
            description: 'Your certain action is unauthorized',
        });
    }

    throwForbiddenError(message: string) {
        throw new ForbiddenException(message, {
            cause: new Error(),
            description: 'Your certain action is forbidden',
        });
    }

    throwNotFoundError(message: string) {
        throw new NotFoundException(message, {
            cause: new Error(),
            description: 'Resources not found',
        })
    }

    throwConflictError(message: string) {
        throw new ConflictException(message, {
            cause: new Error(),
            description: 'Your requested data conflicts with existing data',
        })
    }
}
