import { DataSource } from 'typeorm';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL is not set');

const ds = new DataSource({ type: 'postgres', url });
await ds.initialize();

const tables = await ds.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog','information_schema','auth','storage','realtime',
        'extensions','graphql','graphql_public','pgbouncer','pgsodium','vault',
        'supabase_functions','supabase_migrations')
      AND table_schema NOT LIKE 'pg_%'
    ORDER BY table_schema, table_name
`);

await ds.destroy();

if (tables.length === 0) {
    console.log('No user tables found.');
} else {
    console.log('\nSchema                | Table');
    console.log('----------------------|----------------------');
    for (const row of tables) console.log(`${row.table_schema.padEnd(22)}| ${row.table_name}`);
    console.log('');
}
