import { DataSource, DataSourceOptions } from 'typeorm';

import { SnakeNamingStrategy } from '../snake-naming.strategy';

const dbUrl = new URL(process.env.DB_CONNECTION_URL!);
const schema = dbUrl.searchParams.get('schema') ?? undefined;

export const migrationConfig: DataSourceOptions = {
  type: 'postgres',
  url: dbUrl.toString(),
  schema,
  entities: [`${process.cwd()}/dist*/**/*.entity.js`],
  migrations: [`${process.cwd()}/dist/db/migrations/*.js`],
  migrationsTableName: '_migrations',
  namingStrategy: new SnakeNamingStrategy(),
};

export const migrationDataSource = new DataSource(migrationConfig);
