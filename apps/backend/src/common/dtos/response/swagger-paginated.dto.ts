import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PaginatedOutputDto } from './paginated-output.dto';

export function SwaggerPaginatedDto<T>(ItemDto: Type<T>) {
	class SwaggerPaginatedDtoClass extends PaginatedOutputDto<T> {
		@ApiProperty({ type: [ItemDto] })
		declare data: T[];
	}

	return SwaggerPaginatedDtoClass;
}