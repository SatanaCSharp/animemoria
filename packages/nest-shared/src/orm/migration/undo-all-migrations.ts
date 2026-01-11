#!/usr/bin/env node

import { Logger } from 'pino';

import { createMigrationLogger } from '../packages/nest-shared/src/orm/migration/logger';
import { migrationDataSource } from '../packages/nest-shared/src/orm/migration/migration.config';
import {
  cleanupConnection,
  getExecutedMigrations,
  handleError,
  handleSuccess,
  initializeConnection,
  undoSingleMigration,
} from '../packages/nest-shared/src/orm/migration/migration.utils';

const logger: Logger = createMigrationLogger();

interface MigrationRecord {
  id: number;
  timestamp: number;
  name: string;
}

interface UndoResult {
  undoneCount: number;
  migrations: MigrationRecord[];
}

const logRevertedMigrations = (migrations: MigrationRecord[]): void => {
  if (!migrations.length) {
    return;
  }

  logger.info('Migrations reverted:');
  migrations.forEach((migration, index) => {
    logger.info(
      {
        migrationNumber: index + 1,
        migrationName: migration.name,
        timestamp: migration.timestamp,
      },
      `Migration ${index + 1}/${migrations.length}: ${migration.name}`,
    );
  });
};

const undoAllMigrations = async (
  migrationsToUndo: MigrationRecord[],
): Promise<UndoResult> => {
  const undoRecursive = async (
    remaining: number,
    count: number,
    migrations: MigrationRecord[],
  ): Promise<UndoResult> => {
    if (remaining === 0) {
      return { undoneCount: count, migrations };
    }

    try {
      await undoSingleMigration(migrationDataSource);
      const currentMigration = migrationsToUndo[count];
      logger.info(`Reverted migration ${count + 1}/${migrationsToUndo.length}`);
      return undoRecursive(remaining - 1, count + 1, [
        ...migrations,
        currentMigration,
      ]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error({ error: errorMessage }, 'Failed to undo migration');
      return { undoneCount: count, migrations };
    }
  };

  return undoRecursive(migrationsToUndo.length, 0, []);
};

const execute = async (): Promise<void> => {
  await initializeConnection(migrationDataSource, logger);
  logger.info('⚠️  Undoing ALL migrations...');

  const migrationsToUndo = await getExecutedMigrations(migrationDataSource);

  if (migrationsToUndo.length === 0) {
    logger.info('✓ No migrations to undo');
    await cleanupConnection(migrationDataSource);
    handleSuccess();
  }

  logger.info(`Found ${migrationsToUndo.length} migration(s) to undo`);

  const result = await undoAllMigrations(
    migrationsToUndo as unknown as MigrationRecord[],
  );

  logger.info(`✓ Successfully reverted ${result.undoneCount} migration(s)`);

  if (result.migrations.length > 0) {
    logRevertedMigrations(result.migrations);
  }

  await cleanupConnection(migrationDataSource);
  handleSuccess();
};

execute().catch((error: unknown) => {
  handleError(logger, error, 'Error undoing migrations');
});
