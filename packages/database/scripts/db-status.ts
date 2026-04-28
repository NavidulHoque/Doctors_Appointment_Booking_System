import 'reflect-metadata';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import Table from 'cli-table3';
import { createDevDataSource } from './create-dev-datasource';
import type { MigrationInterface } from 'typeorm';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL is not set');

const migrationsDir = join(import.meta.dir, '../src/migrations');

const files = readdirSync(migrationsDir)
	.filter((f) => f.endsWith('.ts') && !f.startsWith('.'))
	.sort();

if (files.length === 0) {
	console.log('\nNo migration files found.\n');
	process.exit(0);
}

const allMigrationNames: string[] = [];
for (const f of files) {
	const mod = await import(join(migrationsDir, f));
	const cls = Object.values(mod)[0] as (new () => MigrationInterface) & { name: string };
	allMigrationNames.push(cls.name);
}

const dataSource = await createDevDataSource(url);
await dataSource.initialize();

const applied = await dataSource
	.query<{ name: string }[]>(`SELECT name FROM migrations ORDER BY timestamp ASC`)
	.catch(() => [] as { name: string }[]);

await dataSource.destroy();

const appliedNames = new Set(applied.map((r) => r.name));
const nameColWidth = Math.max(...allMigrationNames.map((n) => n.length), 'Migration'.length);

const table = new Table({
	head: ['#', 'Migration', 'Status'],
	colAligns: ['center', 'left', 'center'],
	colWidths: [4, nameColWidth + 2, 8],
});

for (const [i, name] of allMigrationNames.entries()) {
	table.push([i + 1, name, appliedNames.has(name) ? '✅' : '⏳']);
}

console.log('\n' + table.toString() + '\n');
