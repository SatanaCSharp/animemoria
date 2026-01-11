import { Logger } from 'pino';
import { DataSource, Migration } from 'typeorm';

interface MigrationInfo {
  migrationNumber: number;
  migrationName: string;
  timestamp: string;
}

interface ExecutedMigrationRecord {
  id: number;
  timestamp: number;
  name: string;
}

// Pure function to format migration info
export const formatMigrationInfo = (
  migration: Migration,
  index: number,
): MigrationInfo => ({
  migrationNumber: index + 1,
  migrationName: migration.name,
  timestamp: new Date(migration.timestamp).toISOString(),
});

// Pure function to format migration message
export const formatMigrationMessage = (
  index: number,
  total: number,
  name: string,
): string => `Migration ${index + 1}/${total}: ${name}`;

// Log a list of migrations
export const logMigrationList = (
  logger: Logger,
  migrations: Migration[],
  action: 'executed' | 'reverted',
): void => {
  if (!migrations.length) {
    return;
  }

  logger.info(`Migrations ${action}:`);
  migrations.forEach((migration, index) => {
    const info = formatMigrationInfo(migration, index);
    const message = formatMigrationMessage(
      index,
      migrations.length,
      migration.name,
    );
    logger.info(info, message);
  });
};

// Initialize database connection
export const initializeConnection = async (
  dataSource: DataSource,
  logger: Logger,
): Promise<void> => {
  logger.info('🔄 Initializing database connection...');
  await dataSource.initialize();
};

// Cleanup database connection
export const cleanupConnection = async (
  dataSource: DataSource,
): Promise<void> => {
  await dataSource.destroy();
};

// Get executed migrations from database
export const getExecutedMigrations = async (
  dataSource: DataSource,
): Promise<ExecutedMigrationRecord[]> => {
  const tableName = dataSource.options.migrationsTableName || '_migrations';
  return dataSource.query(`SELECT * FROM "${tableName}" ORDER BY id DESC`);
};

// Execute a single undo operation
export const undoSingleMigration = async (
  dataSource: DataSource,
): Promise<void> => {
  await dataSource.undoLastMigration();
};

// Run migrations and return executed list
export const runMigrations = async (
  dataSource: DataSource,
): Promise<Migration[]> => {
  return dataSource.runMigrations();
};

// Handle errors with logging
export const handleError = (
  logger: Logger,
  error: unknown,
  context: string,
): never => {
  const err = error instanceof Error ? error : new Error(String(error));

  logger.error(
    {
      error: err.message,
      stack: err.stack,
    },
    `✗ ${context}`,
  );
  process.exit(1);
};

// Handle success exit
export const handleSuccess = (exitCode: number = 0): never => {
  process.exit(exitCode);
};
