import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PinoLogger } from 'app-logger';
import { PinoTypeormLogger } from 'orm/orm.logger';
import { SnakeNamingStrategy } from 'orm/snake-naming.strategy';
import { DataSource } from 'typeorm';

@Module({})
export class OrmDbModule implements OnModuleInit {
  private readonly MAX_QUERY_EXECUTION_TIME_MS = 5000;
  private readonly INITIAL_CONNECTION_RETRY_DELAY = 2000;
  private readonly INITIAL_CONNECTION_RETRY_ATTEMPTS = 3;
  private readonly CONNECTION_TIMEOUT_MS = 5000;
  private readonly POOL_SIZE = 800;
  private readonly LOCK_TIMEOUT_MS = 100;
  private readonly MIGRATION_TABLE_NAME = '_migrations';

  constructor(
    private readonly logger: PinoLogger,
    private readonly dataSource: DataSource,
  ) {
    this.logger.setContext(OrmDbModule.name);
  }

  onModuleInit(): void {
    this.logger.debug(
      {
        type: this.dataSource.options.type,
        name: this.dataSource.options.name,
      },
      'Connection established',
    );
  }

  forRoot(): DynamicModule {
    return {
      module: OrmDbModule,
      global: true,
      imports: [
        TypeOrmModule.forRootAsync({
          extraProviders: [PinoTypeormLogger],
          inject: [ConfigService, PinoTypeormLogger],
          useFactory: (
            config: ConfigService,
            logger: PinoTypeormLogger,
          ): TypeOrmModuleOptions => {
            const dbUrl = new URL(
              config.getOrThrow<string>('DB_CONNECTION_URL'),
            );
            const schema = dbUrl.searchParams.get('schema') ?? undefined;
            return {
              url: dbUrl.toString(),
              schema,
              logging: 'all',
              logger,
              namingStrategy: new SnakeNamingStrategy(),
              connectTimeoutMS: this.CONNECTION_TIMEOUT_MS,
              // TODO implement application registration info
              applicationName: config.getOrThrow('APP_NAME'),
              migrationsTransactionMode: 'all',
              type: 'postgres',
              entities: [`${process.cwd()}/dist*/**/*.entity.js`],
              migrations: [`${process.cwd()}/dist/database/migrations/*.js`],
              useUTC: true,
              migrationsRun: false,
              extra: {
                options: `-c lock_timeout=${this.LOCK_TIMEOUT_MS}ms -c statement_timeout=${this.MAX_QUERY_EXECUTION_TIME_MS}ms`,
                query_timeout: this.MAX_QUERY_EXECUTION_TIME_MS,
              },
              migrationsTableName: this.MIGRATION_TABLE_NAME,
              poolSize: this.POOL_SIZE,
              retryAttempts: this.INITIAL_CONNECTION_RETRY_ATTEMPTS,
              retryDelay: this.INITIAL_CONNECTION_RETRY_DELAY,
            };
          },
        }),
      ],
    };
  }
}
