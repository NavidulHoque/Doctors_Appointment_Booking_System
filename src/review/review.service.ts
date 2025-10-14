import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { ReviewDto } from './dtos';

@Injectable()
export class ReviewService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async createReview(dto: ReviewDto, patientId: string) {

        const { doctorId, comment, rating } = dto;

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
}
