import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { MigrationInterface } from 'typeorm';
import { User, Doctor, Appointment, Payment, Message, Notification, Review } from '../src/entities';
import { DoctorBreakTime } from '../src/entities/doctor-break-time.entity';
import { DoctorWorkingDay } from '../src/entities/doctor-working-day.entity';

const migrationsDir = join(import.meta.dir, '../src/migrations');

async function loadMigrations(): Promise<(new () => MigrationInterface)[]> {
	const files = readdirSync(migrationsDir)
		.filter((f) => f.endsWith('.ts') && !f.startsWith('.'))
		.sort();

	return Promise.all(
		files.map(async (f) => {
			const mod = await import(join(migrationsDir, f));
			return Object.values(mod)[0] as new () => MigrationInterface;
		}),
	);
}

export async function createDevDataSource(url: string): Promise<DataSource> {
	const migrations = await loadMigrations();
	return new DataSource({
		type: 'postgres',
		url,
		synchronize: false,
		entities: [User, Doctor, Appointment, Payment, Message, Notification, Review, DoctorWorkingDay, DoctorBreakTime],
		migrations,
	});
}
