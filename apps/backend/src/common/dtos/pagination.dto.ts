import { createZodDto } from 'nestjs-zod';
import { PaginationSchema } from '@dab/validation';

export class PaginationDto extends createZodDto(PaginationSchema) {}

export class PaginationResponseDto {
	total: number;
	page: number;
	limit: number;
	totalPages: number;

	constructor(total: number, page: number, limit: number) {
		this.total = total;
		this.page = page;
		this.limit = limit;
		this.totalPages = Math.ceil(total / limit);
	}
}
