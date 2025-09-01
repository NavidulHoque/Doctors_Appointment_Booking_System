import { Controller, UseGuards } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto } from './dto';
import { User } from 'src/user/decorator';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorators';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard, RolesGuard)
@Controller('reviews')
export class ReviewController {

    constructor(
        private readonly reviewService: ReviewService
    ) { }

    @Post("/create-review")
    @Roles(Role.PATIENT)
    async createReview(
        @Body() reviewDto: ReviewDto,
        @User("id") userId: string
    ) {
        return this.reviewService.createReview(reviewDto, userId);
    }
}

