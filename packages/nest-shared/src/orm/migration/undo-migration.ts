#!/usr/bin/env node

import { Logger } from 'pino';

import { createMigrationLogger } from './logger';
import { migrationDataSource } from './migration.config';
import {
  cleanupConnection,
  handleError,
  handleSuccess,
  initializeConnection,
  undoSingleMigration,
} from './migration.utils';

const logger: Logger = createMigrationLogger();

interface MigrationRecord {
  id: number;
  timestamp: number;
  name: string;
}

const getMigrationFromDatabase = async (): Promise<MigrationRecord | null> => {
  const tableName =
    migrationDataSource.options.migrationsTableName || '_migrations';
  const result = await migrationDataSource.query<MigrationRecord[]>(
    `SELECT * FROM "${tableName}" ORDER BY id DESC LIMIT 1`,
  );
  return result.length > 0 ? result[0] : null;
};

const logRevertedMigration = (migration: MigrationRecord): void => {
  logger.info('Migrations reverted:');
  logger.info(
    {
      migrationNumber: 1,
      migrationName: migration.name,
      timestamp: migration.timestamp,
    },
    `Migration 1/1: ${migration.name}`,
  );
};

const execute = async (): Promise<void> => {
  await initializeConnection(migrationDataSource, logger);
  logger.info('Undoing last migration...');

  const lastMigration = await getMigrationFromDatabase();

  if (!lastMigration) {
    logger.info('✓ No migrations to undo');
    await cleanupConnection(migrationDataSource);
    handleSuccess();
  }

  await undoSingleMigration(migrationDataSource);

  logger.info('✓ Successfully reverted last migration');
  logRevertedMigration(lastMigration!);

  await cleanupConnection(migrationDataSource);
  handleSuccess();
};

execute().catch((error: unknown) => {
  handleError(logger, error, 'Error undoing migration');
});
