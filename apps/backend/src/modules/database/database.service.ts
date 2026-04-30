import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { EnvService } from '@dab/backend/modules/config/env.service';

/**
 * DatabaseService provides access to the TypeORM DataSource
 * for advanced database operations beyond the standard repository pattern
 */
@Injectable()
export class DatabaseService {
	constructor(
		private readonly dataSource: DataSource,
		private readonly env: EnvService,
	) {}

	/**
	 * Get the TypeORM DataSource instance
	 */
	getDataSource(): DataSource {
		return this.dataSource;
	}

	/**
	 * Get a query runner for managing transactions
	 */
	getQueryRunner() {
		return this.dataSource.createQueryRunner();
	}

	/**
	 * Execute raw query
	 */
	async query(query: string, parameters?: any[]): Promise<any> {
		return this.dataSource.query(query, parameters);
	}

	/**
	 * Check if database connection is active
	 */
	isConnected(): boolean {
		return this.dataSource.isInitialized;
	}
}
