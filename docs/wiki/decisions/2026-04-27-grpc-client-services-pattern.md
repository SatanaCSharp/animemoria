---
updated: 2026-04-27
type: decision
status: accepted
tags: [grpc, nestjs, client-services, cross-service, backend, architecture]
---

# 2026-04-27 — gRPC Client-Services Pattern

## Context

Services in AniMemoria need to call each other over gRPC. For example, [[services/auth-service]] calls [[services/users-service]] during `signUp` to create a user profile. NestJS provides `ClientGrpc` for outbound gRPC calls, but injecting and initializing a raw `ClientGrpc` in command processors couples the transport infrastructure directly to business logic. A wrapper layer was needed to keep command processors clean and make cross-service calls mockable in tests.

## Decision

Each outbound gRPC dependency is wrapped in a **client service** class, placed in `src/shared/client-services/` of the calling service app.

### Structure

```
apps/<service>/src/shared/client-services/
  client-services.ts          # barrel array: export const clientServices = [...]
  <target-service>.client-service.ts
```

The barrel file `client-services.ts` exports a `clientServices` array that `SharedModule` spreads into its `providers` and `exports` arrays, making client services available throughout the app via DI.

### Implementation contract

A client service:

1. Implements `OnModuleInit` to initialize the typed gRPC stub.
2. Injects the `ClientGrpc` token via `@InjectGrpcServiceClient('<target-service>')` (from `@packages/nest-shared/grpc`).
3. Exposes typed async wrapper methods that hide the Observable-to-Promise conversion (`firstValueFrom`).
4. Returns typed response objects from `@packages/grpc`.

```typescript
// apps/auth-service/src/shared/client-services/users.client-service.ts
@Injectable()
export class UsersClientService implements OnModuleInit {
  private usersServiceClient!: grpc.UsersServiceClient;

  constructor(
    @InjectGrpcServiceClient('users-service')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.usersServiceClient = this.client.getService<grpc.UsersServiceClient>(
      grpc.USERS_SERVICE_NAME,
    );
  }

  async createUser(
    request: grpc.CreateUserRequest,
  ): Promise<grpc.CreateUserResponse> {
    return firstValueFrom(this.usersServiceClient.createUser(request));
  }
}
```

### Usage in command processors

Command processors inject the client service by class type — no gRPC infrastructure visible at the use-case layer.

```typescript
// apps/auth-service/src/account/use-case/commands/sign-up.command.ts
export class SignUpCommandProcessor implements CommandProcessor<
  SignUpCommand,
  AccountResponse
> {
  constructor(private readonly usersClient: UsersClientService) {}

  async process(command: SignUpCommand): Promise<AccountResponse> {
    // ...
    await this.usersClient.createUser({ email: command.email, accountId });
    // ...
  }
}
```

### Testing

Client services are mocked at the `SharedModule` provider boundary in unit tests. The mock mirrors the typed interface without any gRPC infrastructure.

```typescript
// apps/auth-service/src/test/shared/client-services/users-client-service.mock.ts
export const usersClientServiceMock = {
  createUser: jest.fn(),
};
```

Command processor specs replace the real `UsersClientService` with the mock provider — no gRPC client setup required.

### Why `src/shared/client-services/` and not `src/<module>/`

A client service wraps a dependency on an external service, not on a module-internal concept. Multiple modules in the same service may call the same external service (e.g., both `account` and `session` modules might need `UsersClientService`). Placing client services in `src/shared/` makes them available to all modules without duplication and gives them a predictable, consistent location.

If only one module ever calls a particular external service, the client service still lives in `src/shared/client-services/` — cross-service integrations are structural dependencies, not module-private details.

## Consequences

- Command processors stay transport-agnostic: they call `UsersClientService.createUser(...)`, not `firstValueFrom(grpcStub.createUser(...))`.
- Tests mock the client service class, not gRPC internals.
- Adding a new outbound gRPC dependency follows a clear, one-file-per-target pattern.
- `SharedModule` is the single registration point for all outbound gRPC clients; no ad-hoc provider declarations in feature modules.

## Cross-references

- [[services/auth-service]]
- [[services/users-service]]
- [[decisions/2026-04-27-intra-service-layer-architecture]]
- [[decisions/2026-04-27-scope-tiers-module-shared-package]]
- [[packages/grpc]]
- [[packages/nest-shared]]
