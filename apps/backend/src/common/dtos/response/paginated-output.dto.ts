import { ApiProperty } from "@nestjs/swagger";

export class PaginatedOutputDto<T> {
	@ApiProperty()
	data: T[];

	@ApiProperty()
	total: number;

	@ApiProperty()
	page: number;

	@ApiProperty()
	limit: number;

	@ApiProperty()
	totalPages: number;

	@ApiProperty()
	hasPreviousPage: boolean;

	@ApiProperty()
	hasNextPage: boolean;

	constructor(data: T[], total: number, page: number, limit: number) {
		this.data = data;
		this.total = total;
		this.page = page;
		this.limit = limit;
		this.totalPages = Math.ceil(total / limit);
		this.hasPreviousPage = page > 1;
		this.hasNextPage = page < this.totalPages;
	}
}