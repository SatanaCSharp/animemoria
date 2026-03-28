# @packages/grpc

Generated TypeScript bindings for all AniMemoria gRPC contracts.
Compiled from `.proto` files in `protobufs/` using `ts-proto`.
Do NOT edit files under `src/generated/` manually — run `pnpm proto:generate` to regenerate.

## Regenerating

```bash
pnpm --filter @packages/grpc proto:generate   # compile .proto → TypeScript
pnpm --filter @packages/grpc build             # tsc
```

To watch for `.proto` file changes during development:

```bash
pnpm --filter @packages/grpc proto:watch
```

## Exported services

### `AuthService` (`protobufs/auth_service.proto`)

Token refresh for authenticated sessions. Called by `api-gateway-service` when a client presents an expired access token alongside a valid refresh token.

**Client interface:** `AuthServiceClient`
**Controller interface:** `AuthServiceController` + `AuthServiceControllerMethods()` decorator
**Key message types:** `RefreshTokensRequest`, `RefreshTokensResponse`
**Service name constant:** `AUTH_SERVICE_NAME`

#### Usage

```typescript
// Inject via @packages/nest-shared/grpc — do not instantiate directly.
import type { AuthServiceClient } from '@packages/grpc';

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

### `UsersService` (`protobufs/users_service.proto`)

User domain operations. Called by `auth-service` after account creation to provision the corresponding user profile.

**Client interface:** `UsersServiceClient`
**Controller interface:** `UsersServiceController` + `UsersServiceControllerMethods()` decorator
**Key message types:** `CreateUserRequest`, `CreateUserResponse`
**Service name constant:** `USERS_SERVICE_NAME`

#### Usage

```typescript
// Inject via @packages/nest-shared/grpc — do not instantiate directly.
import type { UsersServiceClient } from '@packages/grpc';

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

### `Health` (`protobufs/health.proto`)

Standard [gRPC health checking protocol](https://github.com/grpc/grpc/blob/master/doc/health-checking.md). Implemented by every AniMemoria gRPC service; queried by the service registry and load balancers.

**Client interface:** `HealthClient`
**Controller interface:** `HealthController` + `HealthControllerMethods()` decorator
**Key message types:** `HealthCheckRequest`, `HealthCheckResponse`
**Status enum:** `HealthCheckResponse_ServingStatus` — `SERVING`, `NOT_SERVING`, `UNKNOWN`, `SERVICE_UNKNOWN`
**Service name constant:** `HEALTH_SERVICE_NAME`

`check()` is a unary RPC; `watch()` is a server-streaming RPC that emits status updates when the service health changes.

#### Usage

```typescript
// Implementing the health endpoint in a NestJS gRPC service:
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
