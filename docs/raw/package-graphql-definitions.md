# @packages/graphql-definitions

Backend-only package that is the **single source of truth for all GraphQL contracts** in the AniMemoria monorepo. Defines entities, input DTOs, and resolver interfaces using `@nestjs/graphql` decorators. Backend services implement these interfaces to expose GraphQL operations. The package also contains the schema generation script that compiles all definitions into a plain `schema.gql` consumed by `@packages/graphql-generated` — keeping NestJS dependencies out of frontend apps entirely.

---

## Contract-first workflow

All GraphQL API changes start here, not in individual services.

1. Add or update types in `packages/graphql/definitions/src/<domain>/`.
2. Run `pnpm --filter @packages/graphql-definitions build:schema` to recompile and write `packages/graphql/generated/schema.gql`.
3. Implement the updated interface in the target service resolver.

> The `build:schema` script boots a minimal NestJS `GraphQLSchemaBuilderModule`, passes all resolver interfaces to `GraphQLSchemaFactory`, and writes the printed SDL to `packages/graphql/generated/schema.gql`.

---

## `@packages/graphql-definitions/user`

GraphQL contract for the **User** domain. Consumed by `apps/users-service`.

**Exported types:**

| Export                  | Kind          | Description                                                                                              |
| ----------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `User`                  | `@ObjectType` | Federated entity (`@key(fields: "id")`). Fields: `id`, `email` (`@shareable`), `nickname` (`@shareable`) |
| `CreateUserInput`       | `@InputType`  | Input for user creation. Validated fields: `nickname`, `email`                                           |
| `UserMutationInterface` | `@Resolver`   | Contract resolver — declares `createUser(input: CreateUserInput): User`                                  |
| `UserQueryInterface`    | `@Resolver`   | Contract resolver — declares `getUsers(): [User]`                                                        |

### Usage

```typescript
// apps/users-service — implement both interfaces in the actual resolver
import {
  User,
  CreateUserInput,
  UserMutationInterface,
  UserQueryInterface,
} from '@packages/graphql-definitions/user';

@Resolver(() => User)
export class UsersResolver
  implements UserMutationInterface, UserQueryInterface
{
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.usersCommandProcessor.createUser(input);
  }

  async getUsers(): Promise<User[]> {
    return this.usersQueryProcessor.getUsers();
  }
}
```

---

## `@packages/graphql-definitions/account`

GraphQL contract for the **Account** domain. Consumed by `apps/auth-service`.

**Exported types:**

| Export                     | Kind          | Description                                                                                    |
| -------------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `Account`                  | `@ObjectType` | Federated entity (`@key(fields: "id")`). Fields: `id`, `email`, `user: User`                   |
| `AccountResponse`          | `@ObjectType` | Auth operation response. Fields: `accessToken`                                                 |
| `SignUpInput`              | `@InputType`  | Registration input. Validated: `nickname` (min 1), `email` (email), `password` (min 8, max 32) |
| `SignInInput`              | `@InputType`  | Login input. Validated: `email` (email), `password` (min 8)                                    |
| `AccountMutationInterface` | `@Resolver`   | Contract resolver — declares `signUp`, `signIn`, `blockAccount`, `unblockAccount`              |
| `AccountQueryInterface`    | `@Resolver`   | Contract resolver — declares `me(id): Account`                                                 |

### Usage

```typescript
// apps/auth-service — implement both interfaces in the actual resolver
import {
  Account,
  AccountResponse,
  SignUpInput,
  SignInInput,
  AccountMutationInterface,
  AccountQueryInterface,
} from '@packages/graphql-definitions/account';

@Resolver(() => Account)
export class AccountResolver
  implements AccountMutationInterface, AccountQueryInterface
{
  async signUp(
    @Args('input') input: SignUpInput,
    @Context() context: GraphQLContext,
  ): Promise<AccountResponse> {
    return this.accountCommandProcessor.signUp(input, context);
  }

  async me(@Args('id') id: string): Promise<Account> {
    return this.accountQueryProcessor.me(id);
  }
  // ... signIn, blockAccount, unblockAccount
}
```

---

## Schema generation

The `generate-gql-schema.ts` script is the bridge between backend contracts and frontend consumption.

**How it works:**

1. NestJS `GraphQLSchemaBuilderModule` bootstraps in a minimal, headless mode.
2. `GraphQLSchemaFactory.create()` receives all resolver interface classes from both domains.
3. The resulting schema is serialised with `printSchema()` and written to `packages/graphql/generated/schema.gql`.
4. Frontend apps reference `@packages/graphql-generated/schema` — a plain SDL file with zero NestJS dependencies.

**Run:**

```bash
pnpm --filter @packages/graphql-definitions build:schema
```

**Adding a new domain to schema generation:**

1. Create `src/<domain>/generated-schema-exports.ts` exporting `export const <domain>Resolvers = [...]`.
2. Import and include the resolvers array in `src/generate-gql-schema.ts` → `collectResolvers(...)`.
3. Re-run `build:schema`.

---

## Related packages

- `packages/graphql/generated` — receives the compiled `schema.gql`; consumed by frontend codegen (`apps/admin`, `apps/web`)
- `apps/auth-service` — implements `AccountMutationInterface`, `AccountQueryInterface`
- `apps/users-service` — implements `UserMutationInterface`, `UserQueryInterface`
- `packages/nest-shared/graphql` — Apollo Federation server module used by services that host these resolvers
