import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ErrorHandlerService } from '@backend/common/services/error-handler.service';

describe('ErrorHandlerService', () => {
	let service: ErrorHandlerService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({ providers: [ErrorHandlerService] }).compile();
		service = module.get(ErrorHandlerService);
	});

	it('throws ConflictException on unique constraint violation', () => {
		expect(() => service.handleDbError({ code: '23505' })).toThrow(ConflictException);
	});

	it('rethrows unknown errors as-is', () => {
		const err = new Error('unexpected');
		expect(() => service.handleDbError(err)).toThrow(err);
	});

	it('rethrows non-object errors', () => {
		expect(() => service.handleDbError('string error')).toThrow('string error');
	});
});
