import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '@dab/database';
import type { CreateReviewDto } from '@dab/backend/modules/review/dtos/review.dto';

@Injectable()
export class ReviewService {
	constructor(
		@InjectRepository(Review)
		private readonly reviewRepo: Repository<Review>,
	) {}

	async createReview(dto: CreateReviewDto, patientId: string) {
		const review = await this.reviewRepo.save(
			this.reviewRepo.create({
				patientId,
				doctorId: dto.doctorId,
				comment: dto.comment ?? null,
				rating: dto.rating,
			}),
		);

		return { data: review, message: 'Review created successfully' };
	}
}
