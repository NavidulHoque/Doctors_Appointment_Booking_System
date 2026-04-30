import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '@dab/database';
import { ReviewService } from '@dab/backend/modules/review/review.service';
import { ReviewController } from '@dab/backend/modules/review/review.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Review])],
	providers: [ReviewService],
	controllers: [ReviewController],
})
export class ReviewModule {}
