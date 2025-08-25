import { Controller, UseGuards } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewDto } from './dto';
import { CheckRoleService } from 'src/common/checkRole.service';
import { UserDto } from 'src/user/dto';
import { User } from 'src/user/decorator';
import { AuthGuard } from 'src/auth/guard';

@UseGuards(AuthGuard)
@Controller('reviews')
export class ReviewController {

    constructor(
        private readonly reviewService: ReviewService,
        private checkRoleService: CheckRoleService
    ) { }

    @Post("/create-review")
    async createReview(
        @Body() reviewDto: ReviewDto,
        @User() user: UserDto
    ) {
        this.checkRoleService.checkIsPatient(user.role)
        return this.reviewService.createReview(reviewDto, user);
    }
}

