import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewDto } from './dto';
import { HandleErrorsService } from 'src/common/handleErrors.service';
import { UserDto } from 'src/user/dto';

@Injectable()
export class ReviewService {
    constructor(
        private prisma: PrismaService,
        private handleErrorsService: HandleErrorsService
    ) { }

    async createReview(dto: ReviewDto, user: UserDto) {

        const { doctorId, comment, rating } = dto;
        const patientId = user.id

        try {
            const review = await this.prisma.review.create({
                data: {
                    patientId,
                    doctorId,
                    comment,
                    rating
                }
            })

            return {
                data: review,
                message: "Review created successfully"
            }
        }

        catch (error) {
            this.handleErrorsService.handleError(error)
        }
    }
}
