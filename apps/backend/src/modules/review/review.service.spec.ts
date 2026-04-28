import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from '@dab/database';
import { ReviewService } from '@backend/modules/review/review.service';

const mockRepo = () => ({ create: jest.fn(), save: jest.fn() });

describe('ReviewService', () => {
	let service: ReviewService;
	let repo: ReturnType<typeof mockRepo>;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [ReviewService, { provide: getRepositoryToken(Review), useFactory: mockRepo }],
		}).compile();
		service = module.get(ReviewService);
		repo = module.get(getRepositoryToken(Review));
	});

	it('creates a review and returns success message', async () => {
		const review = { id: 'r1', doctorId: 'd1', patientId: 'p1', rating: 5, comment: 'Great' } as Review;
		repo.create.mockReturnValue(review);
		repo.save.mockResolvedValue(review);

		const result = await service.createReview({ doctorId: 'd1', rating: 5, comment: 'Great' }, 'p1');
		expect(result.message).toBe('Review created successfully');
		expect(result.data).toEqual(review);
	});

	it('creates review with null comment when not provided', async () => {
		const review = { id: 'r1', doctorId: 'd1', patientId: 'p1', rating: 4, comment: null } as Review;
		repo.create.mockReturnValue(review);
		repo.save.mockResolvedValue(review);

		const result = await service.createReview({ doctorId: 'd1', rating: 4 }, 'p1');
		expect(result.data.comment).toBeNull();
	});
});
