export class PaginationResponseDto {
    readonly totalItems: number;
    readonly totalPages: number;
    readonly currentPage: number;
    readonly itemsPerPage: number;

    constructor(totalItems: number, currentPage: number, itemsPerPage: number) {
        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = currentPage;
        this.totalPages = Math.ceil(totalItems / itemsPerPage);
    }
}