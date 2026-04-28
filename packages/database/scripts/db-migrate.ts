import { createDevDataSource } from './create-dev-datasource';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL is not set');

const dataSource = await createDevDataSource(url);
await dataSource.initialize();

const migrations = await dataSource.runMigrations({ transaction: 'all' });

if (migrations.length === 0) {
	console.log('No pending migrations.');
} else {
	console.log(`Ran ${migrations.length} migration(s):`);
	for (const m of migrations) console.log(`  ✓ ${m.name}`);
}

await dataSource.destroy();
