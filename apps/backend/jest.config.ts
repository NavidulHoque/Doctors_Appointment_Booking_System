import type { Config } from 'jest';

const config: Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: 'src',
	testRegex: '.*\\.spec\\.ts$',
	transform: { '^.+\\.(t|j)s$': 'ts-jest' },
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: '../coverage',
	testEnvironment: 'node',
	moduleNameMapper: {
		'^@backend/(.*)$': '<rootDir>/$1',
		'^@dab/database$': '<rootDir>/../../../packages/database/src',
		'^@dab/shared$': '<rootDir>/../../../packages/shared/src',
		'^@dab/supabase$': '<rootDir>/../../../packages/supabase/src',
		'^@dab/validation$': '<rootDir>/../../../packages/validation/src',
	},
};

export default config;
