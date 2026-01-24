#!/usr/bin/env node

import { Logger } from 'pino';

import { createMigrationLogger } from './logger';
import { migrationDataSource } from './migration.config';
import {
  cleanupConnection,
  handleError,
  handleSuccess,
  initializeConnection,
  logMigrationList,
  runMigrations,
} from './migration.utils';

const logger: Logger = createMigrationLogger();

const execute = async (): Promise<void> => {
  await initializeConnection(migrationDataSource, logger);
  logger.info('Starting migration execution...');

  const migrations = await runMigrations(migrationDataSource);

  if (!migrations.length) {
    logger.info('✓ No pending migrations to run');
    await cleanupConnection(migrationDataSource);
    handleSuccess();
  }

  logger.info(`✓ Successfully executed ${migrations.length} migration(s)`);
  logMigrationList(logger, migrations, 'executed');
  logger.info('✓ All migrations completed successfully');

  await cleanupConnection(migrationDataSource);
  handleSuccess();
};

execute().catch((error: unknown) => {
  handleError(logger, error, 'Error running migrations');
});
