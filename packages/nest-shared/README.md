# @packages/nest-shared

Shared NestJS infrastructure library for the AniMemoria monorepo. Provides reusable modules for logging, authentication, configuration, database access, health checks, gRPC communication, service discovery, and graceful shutdown — consumed by all microservices.

---

## `@packages/nest-shared/app-logger`

Centralised structured logging via [Pino](https://getpino.io). Wraps `nestjs-pino` as a global NestJS module. Supports pretty-printing for development and JSON output for production.

**Env vars:** `LOG_LEVEL` (required), `LOG_PRETTY` (optional, `true`/`false`)

### Usage

```typescript
// app.module.ts
import { AppLoggerModule } from '@packages/nest-shared/app-logger';

@Module({
  imports: [AppLoggerModule.forRoot()],
})
export class AppModule {}

// any.service.ts
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class SomeService {
  constructor(
    @InjectPinoLogger(SomeService.name)
    private readonly logger: PinoLogger,
  ) {}

  doWork() {
    this.logger.info('Working...');
  }
}
```

---

## `@packages/nest-shared/auth`

JWT authentication for REST and GraphQL transports. Provides Passport strategies, guards, and the `@CurrentUser()` decorator. Supports access tokens (Bearer) and refresh tokens (HTTP-only cookie).

**Env vars:** `AT_SECRET`, `RT_SECRET` (when refresh token is enabled)

### Usage

```typescript
// app.module.ts
import { AuthModule } from '@packages/nest-shared/auth';

@Module({
  imports: [AuthModule.forRoot({ enableRefreshToken: true })],
})
export class AppModule {}

// users.resolver.ts
import { JwtGuard, GqlAuthGuard, CurrentUser, JwtPayload } from '@packages/nest-shared/auth';

// REST controller
@UseGuards(JwtGuard)
@Get('profile')
getProfile(@CurrentUser() user: JwtPayload) {
  return user;
}

// GraphQL resolver
@UseGuards(GqlAuthGuard)
@Query(() => User)
me(@CurrentUser() user: JwtPayload) {
  return user;
}

// Refresh token endpoint (REST)
@UseGuards(JwtRtGuard)
@Post('refresh')
refresh(@CurrentUser() user: JwtRtStrategyPayload, @Res() res: Response) {
  // issue new tokens, then:
  setRefreshTokenCookie(res, newRefreshToken);
}
```

---

## `@packages/nest-shared/config`

Global environment configuration. Wraps `@nestjs/config` with `.env` file support and variable expansion. Env file path is overridable via `DOTENV_CONFIG_PATH`.

### Usage

```typescript
// app.module.ts
import { ConfigModule } from '@packages/nest-shared/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}

// any.service.ts
import { ConfigService } from '@packages/nest-shared/config';

@Injectable()
export class SomeService {
  constructor(private readonly config: ConfigService) {}

  getHost(): string {
    return this.config.getOrThrow<string>('APP_HOST');
  }
}
```

---

## `@packages/nest-shared/graceful-shutdown`

Coordinates orderly service shutdown. Registered cleanup callbacks are executed concurrently via `Promise.allSettled()` before the process exits.

### Usage

```typescript
// app.module.ts
import { GracefulShutdownModule } from '@packages/nest-shared/graceful-shutdown';

@Module({
  imports: [GracefulShutdownModule],
})
export class AppModule {}

// database.module.ts
import { GracefulShutdownService } from '@packages/nest-shared/graceful-shutdown';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    private readonly shutdown: GracefulShutdownService,
    private readonly connection: DataSource,
  ) {}

  onModuleInit() {
    this.shutdown.registerShutdownCallback(async () => {
      await this.connection.destroy();
    });
  }
}
```

---

## `@packages/nest-shared/graphql`

Apollo Federation v2 GraphQL server configuration. Enables federated schema composition, introspection, and Apollo Sandbox.

### Usage

```typescript
// app.module.ts
import { ApolloGqlGraphQLModule } from '@packages/nest-shared/graphql';

@Module({
  imports: [
    ApolloGqlGraphQLModule.forRoot({
      orphanedTypes: [SomeUnreferencedType],
    }),
  ],
})
export class AppModule {}

// Accessing request/response in a resolver
import { GraphQLContext } from '@packages/nest-shared/graphql';

@Resolver()
export class SomeResolver {
  @Query(() => String)
  hello(@Context() ctx: GraphQLContext): string {
    return ctx.req.headers['x-custom-header'] as string;
  }
}
```

---

## `@packages/nest-shared/grpc`

gRPC client registration and service discovery. Resolves service URLs from the central registry, loads proto definitions, and wires typed clients for injection.

**Env vars:** `INTERNAL_REGISTRY_SERVER_HOST`

### Usage

```typescript
// app.module.ts
import { GrpcClientModule } from '@packages/nest-shared/grpc';

@Module({
  imports: [GrpcClientModule.forRoot(['users-service', 'auth-service'])],
})
export class AppModule {}

// gateway.service.ts
import { InjectGrpcServiceClient } from '@packages/nest-shared/grpc';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class GatewayService implements OnModuleInit {
  private usersService: UsersServiceClient;

  constructor(
    @InjectGrpcServiceClient('users-service')
    private readonly usersClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService =
      this.usersClient.getService<UsersServiceClient>('UsersService');
  }
}

// main.ts — configuring a gRPC server
import { getServerGrpcOption } from '@packages/nest-shared/grpc';

const app = await NestFactory.createMicroservice(
  AppModule,
  getServerGrpcOption('users-service', '0.0.0.0:5000'),
);
```

---

## `@packages/nest-shared/health`

Health check endpoints for Kubernetes liveness/readiness probes. Selects HTTP or gRPC transport at module configuration time. Supports custom health indicators.

### Usage

```typescript
// app.module.ts — REST/GraphQL service
import {
  HealthModule,
  TypeOrmHealthcheckIndicator,
} from '@packages/nest-shared/health';
import { AppType } from '@packages/nest-shared/shared';

@Module({
  imports: [
    HealthModule.forRoot({
      appType: AppType.REST,
      healthcheckIndicators: [TypeOrmHealthcheckIndicator],
    }),
  ],
})
export class AppModule {}

// app.module.ts — gRPC service
@Module({
  imports: [
    HealthModule.forRoot({
      appType: AppType.GRPC,
      healthcheckIndicators: [TypeOrmHealthcheckIndicator],
    }),
  ],
})
export class AppModule {}
```

**HTTP endpoints (REST/GQL):**

- `GET /health` — full health check
- `GET /health/live` — liveness probe
- `GET /health/ready` — readiness probe

**gRPC:** implements `grpc.health.v1.Health` with `check()` and streaming `watch()`.

---

## `@packages/nest-shared/orm`

TypeORM/PostgreSQL infrastructure. Handles connection pooling, query timeouts, snake_case naming conventions, and Pino-integrated query logging. Provides `BaseEntity` (timestamps) and `BaseRepository<T>` for data access.

**Env vars:** `DB_CONNECTION_URL` (supports `?schema=` param), `APP_NAME`

### Usage

```typescript
// app.module.ts
import { OrmDbModule } from '@packages/nest-shared/orm';

@Module({
  imports: [OrmDbModule.forRoot()],
})
export class AppModule {}

// user.entity.ts
import { BaseEntity } from '@packages/nest-shared/orm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;
}

// user.repository.ts
import { BaseRepository } from '@packages/nest-shared/orm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(dataSource, User);
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }
}
```

---

## `@packages/nest-shared/orm/migration`

Exports a pre-configured TypeORM `DataSource` (`migrationDataSource`) for running migrations outside the NestJS app context (CLI scripts).

### Usage

```typescript
// typeorm.config.ts (used by migration scripts)
import { migrationDataSource } from '@packages/nest-shared/orm/migration';

export default migrationDataSource;
```

---

## `@packages/nest-shared/orm/migration/run-migration`

CLI script that initialises `migrationDataSource` and runs all pending migrations.

### Usage

```json
// package.json
{
  "scripts": {
    "migration:run": "ts-node -r tsconfig-paths/register node_modules/@packages/nest-shared/dist/orm/migration/run-migrations.js"
  }
}
```

---

## `@packages/nest-shared/orm/migration/undo-migration`

CLI script that reverts the most recently applied migration.

### Usage

```json
{
  "scripts": {
    "migration:revert": "ts-node -r tsconfig-paths/register node_modules/@packages/nest-shared/dist/orm/migration/undo-migration.js"
  }
}
```

---

## `@packages/nest-shared/orm/migration/undo-all-migrations`

CLI script that reverts all applied migrations in reverse order.

### Usage

```json
{
  "scripts": {
    "migration:revert:all": "ts-node -r tsconfig-paths/register node_modules/@packages/nest-shared/dist/orm/migration/undo-all-migrations.js"
  }
}
```

---

## `@packages/nest-shared/registry-service`

Self-registration and deregistration with the central `registry-service`. On startup, POSTs service metadata (name, host, serviceId) to the registry. On shutdown, DELETEs the entry via `GracefulShutdownService`.

**Env vars:** `INTERNAL_REGISTRY_SERVER_HOST`, `APP_NAME`, `{APP_NAME_UPPER}_REST_URL` / `{APP_NAME_UPPER}_GRPC_URL` / `{APP_NAME_UPPER}_GRAPHQL_URL`

### Usage

```typescript
// app.module.ts
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';

@Module({
  imports: [ClientRegistrationModule.forRoot({ appType: AppType.REST })],
})
export class AppModule {}
```

---

## `@packages/nest-shared/shared`

Pure-TypeScript types and enums shared across all modules and services. No NestJS dependencies.

**Exports:**

- `AppType` enum — `REST | GQL | GRPC`
- `ServiceId` — string alias for service identifiers
- `ServiceDescription` — `{ serviceId, serviceName, host }`
- `ServiceInitializationOptions` — `{ appType: AppType }`
- `CommandProcessor` / `QueryProcessor` — CQRS handler interfaces

### Usage

```typescript
import { AppType, ServiceDescription } from '@packages/nest-shared/shared';

const desc: ServiceDescription = {
  serviceId: 'users-service:rest',
  serviceName: 'users-service',
  host: 'http://users-service:3001',
};

ClientRegistrationModule.forRoot({ appType: AppType.GRPC });
```
