import { createDevDataSource } from './create-dev-datasource';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL is not set');

const name = process.argv[2];
if (!name) throw new Error('Usage: bun run db:generate <MigrationName>');

const dataSource = await createDevDataSource(url);
await dataSource.initialize();

const timestamp = Date.now();
const className = `${name}${timestamp}`;
const migrationPath = `src/migrations/${timestamp}-${name}.ts`;

const sqlUp: string[] = [];
const sqlDown: string[] = [];

const pendingSql = await dataSource.driver.createSchemaBuilder().log();
for (const query of pendingSql.upQueries) sqlUp.push(`        await queryRunner.query(\`${query.query}\`);`);
for (const query of pendingSql.downQueries) sqlDown.push(`        await queryRunner.query(\`${query.query}\`);`);

await dataSource.destroy();

if (sqlUp.length === 0) {
	console.log('No schema changes detected. Migration not generated.');
	process.exit(0);
}

const content = `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${className} implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
${sqlUp.join('\n')}
    }

    async down(queryRunner: QueryRunner): Promise<void> {
${sqlDown.join('\n')}
    }
}
`;

await Bun.write(migrationPath, content);
console.log(`Generated migration: ${migrationPath}`);
