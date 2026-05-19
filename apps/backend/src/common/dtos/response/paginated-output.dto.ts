export class PaginatedOutputDto<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasPreviousPage: boolean;
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