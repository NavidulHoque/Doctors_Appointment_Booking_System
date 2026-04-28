import { createDevDataSource } from './create-dev-datasource';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL is not set');

const dataSource = await createDevDataSource(url);
await dataSource.initialize();

await dataSource.undoLastMigration({ transaction: 'all' });
console.log('Last migration reverted.');

await dataSource.destroy();
