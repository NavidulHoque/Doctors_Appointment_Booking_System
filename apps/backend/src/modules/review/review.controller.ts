import { Body, Controller, Post } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiForbiddenResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReviewService } from '@dab/backend/modules/review/review.service';
import { CreateReviewDto } from '@dab/backend/modules/review/dtos/review.dto';
import { Roles } from '@dab/backend/common/decorators/roles.decorator';
import { CurrentUser } from '@dab/backend/common/decorators/current-user.decorator';
import { Role } from '@dab/shared';
import type { User } from '@dab/database';

@ApiTags('reviews')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
@Controller('reviews')
export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	@Roles(Role.PATIENT)
	@Post()
	@ApiOperation({ summary: 'Patient: submit a review for a doctor' })
	@ApiCreatedResponse({ description: 'Review submitted successfully' })
	@ApiForbiddenResponse({ description: 'Patient role required' })
	@ApiConflictResponse({ description: 'Review already submitted for this doctor' })
	createReview(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
		return this.reviewService.createReview(dto, user.id);
	}
}
