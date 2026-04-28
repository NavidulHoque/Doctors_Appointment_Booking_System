import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class ErrorHandlerService {
	handleDbError(error: unknown): never {
		if (this.isUniqueConstraintError(error)) {
			throw new ConflictException('Record already exists');
		}
		throw error;
	}

	private isUniqueConstraintError(error: unknown): boolean {
		return (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			(error as { code: string }).code === '23505'
		);
	}
}
