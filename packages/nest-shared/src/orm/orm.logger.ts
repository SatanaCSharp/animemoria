import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'app-logger';
import {
  AbstractLogger,
  Logger,
  LoggerOptions,
  LogLevel,
  LogMessage,
  QueryRunner,
} from 'typeorm';

@Injectable()
export class PinoTypeormLogger extends AbstractLogger implements Logger {
  constructor(
    private readonly logger: PinoLogger,
    options?: LoggerOptions,
  ) {
    super(options);
    this.logger.setContext(PinoTypeormLogger.name);
  }
  protected writeLog(
    level: LogLevel,
    logMessage: LogMessage | LogMessage[],
    queryRunner?: QueryRunner,
  ): void {
    const messages = this.prepareLogMessages(
      logMessage,
      {
        highlightSql: true,
      },
      queryRunner,
    );

    for (const message of messages) {
      switch (message.type ?? level) {
        case 'log':
        case 'schema-build':
        case 'migration':
          this.logger.debug(message);
          break;

        case 'info':
        case 'query':
          this.logger.info(message);
          break;

        case 'warn':
        case 'query-slow':
          this.logger.warn(message);
          break;

        case 'error':
        case 'query-error':
          this.logger.error(message);
          break;
        default:
          this.logger.trace(message);
      }
    }
  }

  override logQuery(
    query: string,
    parameters?: unknown[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner,
  ): void {
    const sql =
      query +
      (parameters && parameters.length
        ? ` -- PARAMETERS: ${String(this.stringifyParams(parameters))}`
        : '');
    this.logger.debug(sql);
  }

  override logQueryError(
    error: string,
    query: string,
    parameters?: unknown[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner,
  ): void {
    const sql = `${error} ${query} ${
      parameters && parameters.length
        ? ` -- PARAMETERS: ${String(this.stringifyParams(parameters))}`
        : ''
    }`;
    this.logger.error(sql);
  }

  override logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner,
  ): void {
    const sql = `time: ${String(time)} ${query} ${
      parameters && parameters.length
        ? ` -- PARAMETERS: ${String(this.stringifyParams(parameters))}`
        : ''
    }`;
    this.logger.info(sql);
  }

  override logSchemaBuild(
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner,
  ): void {
    this.logger.debug(message);
  }

  override logMigration(
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner,
  ): void {
    this.logger.debug(message);
  }

  override log(
    level: 'log' | 'info' | 'warn',
    message: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _queryRunner?: QueryRunner,
  ): void {
    switch (level) {
      case 'log':
      case 'info':
        this.logger.info(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
      default:
        this.logger.trace(message);
    }
  }
}
