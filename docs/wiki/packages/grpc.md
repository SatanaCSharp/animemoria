---
updated: 2026-04-24
type: package
sources:
  - docs/wiki/raw/package-grpc.md
  - packages/grpc/package.json
  - packages/grpc/src/index.ts
  - packages/grpc/protobufs/auth_service.proto
  - packages/grpc/protobufs/users_service.proto
  - packages/grpc/protobufs/health.proto
tags: [grpc, protobuf, ts-proto, nestjs]
---

# @packages/grpc

Generated TypeScript bindings for all AniMemoria gRPC contracts. Source of truth
for every gRPC service interface in the monorepo — all `.proto` files live here,
and all consumers import from this package.

**Consumers:** [[packages/nest-shared]], [[services/users-service]], [[services/auth-service]], [[services/api-gateway-service]]

---

## Architecture

```
packages/grpc/
├── protobufs/            # Source .proto files — hand-authored, versioned in git
│   ├── auth_service.proto
│   ├── users_service.proto
│   └── health.proto
├── src/
│   ├── generated/        # ts-proto output — never edit manually
│   │   ├── auth_service.ts
│   │   ├── users_service.ts
│   │   ├── health.ts
│   │   └── index*.ts     # per-service index files (ts-proto outputIndex=true)
│   └── index.ts          # barrel: re-exports generated/index + each service
└── dist/                 # tsc output — what consumers import at runtime
```

The build script runs in two phases: `proto:generate` (protoc + ts-proto) followed
by `tsc`. Consumers import only from the package barrel (`@packages/grpc`), never
from deep generated paths.

### ts-proto options

The `proto:generate` script uses these notable flags:

| Option             | Value     | Effect                                                                |
| ------------------ | --------- | --------------------------------------------------------------------- |
| `nestJs`           | `true`    | Emits NestJS-style controller/client interfaces and method decorators |
| `outputIndex`      | `true`    | Emits per-service `index.*.ts` barrel files                           |
| `outputServices`   | `grpc-js` | Generates `@grpc/grpc-js`-compatible service stubs                    |
| `addGrpcMetadata`  | `true`    | Includes gRPC metadata parameter in method signatures                 |
| `useDate`          | `true`    | Maps `google.protobuf.Timestamp` to JS `Date`                         |
| `unrecognizedEnum` | `false`   | Omits `UNRECOGNIZED` catch-all from enums                             |
| `esModuleInterop`  | `true`    | Interop with CommonJS imports                                         |

---

## Exported Services

### `AuthService` — `protobufs/auth_service.proto`

Token refresh for authenticated sessions. Called by [[services/api-gateway-service]]
when a client presents an expired access token alongside a valid refresh token.

**Proto package:** `auth_service`  
**Client interface:** `AuthServiceClient`  
**Controller interface:** `AuthServiceController` + `AuthServiceControllerMethods()` decorator  
**Service name constant:** `AUTH_SERVICE_NAME`

#### RPC contract

| RPC             | Type  | Request                | Response                |
| --------------- | ----- | ---------------------- | ----------------------- |
| `RefreshTokens` | unary | `RefreshTokensRequest` | `RefreshTokensResponse` |

**`RefreshTokensRequest`**

| Field          | #   | Type     |
| -------------- | --- | -------- |
| `sessionId`    | 1   | `string` |
| `accountId`    | 2   | `string` |
| `refreshToken` | 3   | `string` |

**`RefreshTokensResponse`**

| Field          | #   | Type     |
| -------------- | --- | -------- |
| `accessToken`  | 1   | `string` |
| `refreshToken` | 2   | `string` |

#### Usage (client side)

```typescript
import type { AuthServiceClient } from '@packages/grpc';
import { AUTH_SERVICE_NAME } from '@packages/grpc';

// Inject via @packages/nest-shared — do not instantiate directly
@InjectGrpcServiceClient('auth-service')
private readonly client: ClientGrpc;

onModuleInit() {
  this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
}

refreshTokens(sessionId: string, accountId: string, refreshToken: string) {
  return this.authService.refreshTokens({ sessionId, accountId, refreshToken });
}
```

---

### `UsersService` — `protobufs/users_service.proto`

User domain operations. Called by [[services/auth-service]] after account creation
to provision the corresponding user profile in [[services/users-service]].

**Proto package:** `users_service`  
**Client interface:** `UsersServiceClient`  
**Controller interface:** `UsersServiceController` + `UsersServiceControllerMethods()` decorator  
**Service name constant:** `USERS_SERVICE_NAME`

#### RPC contract

| RPC          | Type  | Request             | Response             |
| ------------ | ----- | ------------------- | -------------------- |
| `CreateUser` | unary | `CreateUserRequest` | `CreateUserResponse` |

**`CreateUserRequest`**

| Field       | #   | Type     |
| ----------- | --- | -------- |
| `email`     | 1   | `string` |
| `nickname`  | 2   | `string` |
| `accountId` | 3   | `string` |

**`CreateUserResponse`**

| Field       | #   | Type     |
| ----------- | --- | -------- |
| `id`        | 1   | `string` |
| `email`     | 2   | `string` |
| `nickname`  | 3   | `string` |
| `accountId` | 4   | `string` |

#### Usage (client side)

```typescript
import type { UsersServiceClient } from '@packages/grpc';
import { USERS_SERVICE_NAME } from '@packages/grpc';

// Inject via @packages/nest-shared — do not instantiate directly
@InjectGrpcServiceClient('users-service')
private readonly client: ClientGrpc;

onModuleInit() {
  this.usersService = this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
}

createUser(email: string, nickname: string, accountId: string) {
  return this.usersService.createUser({ email, nickname, accountId });
}
```

---

### `Health` — `protobufs/health.proto`

Standard [gRPC health checking protocol](https://github.com/grpc/grpc/blob/master/doc/health-checking.md).
Implemented by every AniMemoria gRPC service; queried by the service registry and
load balancers.

**Client interface:** `HealthClient`  
**Controller interface:** `HealthController` + `HealthControllerMethods()` decorator  
**Service name constant:** `HEALTH_SERVICE_NAME`  
**Status enum:** `HealthCheckResponse_ServingStatus` — `SERVING`, `NOT_SERVING`, `UNKNOWN`, `SERVICE_UNKNOWN`

#### RPC contract

| RPC     | Type             | Description                              |
| ------- | ---------------- | ---------------------------------------- |
| `check` | unary            | One-shot health query                    |
| `watch` | server-streaming | Emits status updates when health changes |

#### Usage (controller side)

```typescript
import {
  HealthController,
  HealthControllerMethods,
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
} from '@packages/grpc';

@HealthControllerMethods()
@Controller()
export class HealthGrpcController implements HealthController {
  check(_req: HealthCheckRequest): HealthCheckResponse {
    return { status: HealthCheckResponse_ServingStatus.SERVING };
  }
}
```

---

## Development Workflow

### Regenerating bindings

After any `.proto` change:

```bash
# 1. Regenerate TypeScript
pnpm --filter @packages/grpc proto:generate

# 2. Rebuild the package
pnpm --filter @packages/grpc build

# 3. Rebuild consuming services
pnpm --filter <service> build
```

Watch mode during active proto development:

```bash
pnpm --filter @packages/grpc proto:watch
```

Commit the `.proto` change and the regenerated TypeScript in the same commit.

### Proto versioning rules

- Fields are numbered once and **never renumbered** after deployment.
- To remove a field: mark it `[deprecated = true]` first; never delete from a live proto.
- `src/generated/` files are always regenerated — never edit them by hand.

---

## Consumer Map

| Consumer                         | Role                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| [[packages/nest-shared]]         | Provides `@InjectGrpcServiceClient` decorator and gRPC module wiring used by all service consumers |
| [[services/auth-service]]        | Implements `AuthServiceController`; calls `UsersServiceClient` to create user profiles             |
| [[services/users-service]]       | Implements `UsersServiceController`; implements `HealthController`                                 |
| [[services/api-gateway-service]] | Calls `AuthServiceClient` to refresh tokens on behalf of clients                                   |
