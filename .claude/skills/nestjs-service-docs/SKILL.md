---
name: nestjs-service-docs
description: Write or update technical README documentation for a NestJS microservice in the AniMemoria monorepo. Follows the canonical 17-section pattern derived from auth-service and users-service READMEs.
---

You are writing technical documentation for a NestJS microservice in the AniMemoria monorepo.

## Your task

When the user says `/nestjs-service-docs <service-name>` or asks you to document a NestJS service:

1. **Explore the service first** — read the service directory structure, main module files, entrypoints (`*.main.ts`), module files (`*.module.ts`), entities, repositories, controllers/resolvers, and `.env.example`. Do NOT guess; read the actual code.
2. **Produce a README.md** following the canonical 17-section structure below.
3. **Place the file** at `apps/<service-name>/README.md` (or update if it already exists).

---

## Canonical 17-section README structure

### Header

```
# <service-name>

<1-2 sentence description: domain role + transport mechanisms (GraphQL/gRPC/REST)>
```

### 1) Service purpose

Single paragraph (3-4 sentences). Describe:

- What domain data/operations this service owns
- Which protocols/transports it exposes
- Current implementation maturity (production-ready vs. scaffolded/mocked)

### 2) Responsibilities and boundaries

Two bullet-list subsections:

- **In scope** — what this service owns and manages
- **Out of scope** — what it explicitly delegates to other services

### 3) High-level architecture

Describe:

- Dual-runtime model if applicable (GraphQL + gRPC runtimes as separate NestJS apps)
- Shared core modules (`AppBaseModule`, `ConfigModule`, `AppLoggerModule`, `OrmDbModule`, `SharedModule`)
- Module split pattern (domain modules vs transport adapter modules)
- Cross-service integration clients

### 4) Runtime entrypoints and bootstrap flow

Per-runtime subsections (e.g., `### GraphQL runtime`, `### gRPC runtime`, `### Shared bootstrap pieces`).
Use **numbered steps** for each runtime initialization:

1. `NestFactory.create(...)` call
2. Read required port env var
3. Listen / microservice start
4. Enable shutdown hooks

### 5) App modules and responsibilities

Bullet list. Format per item:

```
- `ModuleName` (`src/path/to/module.ts`): brief description of what this module composes or provides.
```

Cover: base module, runtime modules (GraphQL/gRPC), SharedModule, feature/domain modules, adapter modules.

### 6) Public interfaces

Two subsections:

**Interface inventory (maintain here)**

- List transports with source-of-truth file paths:
  - GraphQL endpoints: `src/[feature]/graphql/[mutations|queries]/*`
  - GraphQL contracts: `packages/graphql/definitions/src/[feature]/*`
  - gRPC endpoints: `src/[feature]/grpc/controllers/*`
  - gRPC contracts: `packages/grpc/protobufs/[service_name].proto`
- Do NOT enumerate every operation signature here — point to files instead.
- Do NOT list specific endpoint URLs or HTTP method+path patterns — paths belong in the code, not the README.

**Update policy**

- Contract-first: update contracts in `packages/graphql/definitions` or `packages/grpc/protobufs` first, then implement transport adapters.

### 7) Internal request flows

One subsection per major operation (e.g., `### GraphQL signUp`, `### gRPC RefreshTokens`, `### Register service`).
Name the subsection by the logical operation, not by HTTP method or URL path.
Use **numbered steps**:

1. Entry point (resolver/controller method + input)
2. Command processor delegation
3. Validation steps
4. External integrations (gRPC calls, etc.)
5. Persistence
6. Response / token / cookie handling
   Include relevant implementation details (e.g., bcrypt salt rounds, JWT claims).
   Do NOT use HTTP method + URL path as the subsection heading (e.g., avoid `### REST POST /:app_type/register`).

### 8) Data and persistence

Two bullet lists:

- **Entities** — list entity class names (paths: `src/shared/domain/entities/*`)
- **Repositories** — list repository class names (paths: `src/shared/domain/repositories/*`)

### 9) Integrations

Bullet list. Format per integration:

```
- **Service/System name (transport):** what it's used for, key adapter file, contract location. Note resilience patterns or failure behavior.
```

### 10) Service specific peculiarities

Bullet list of non-standard implementation details:

- Security-relevant behavior (hashing, cookie attributes, header requirements)
- Deviations from standard NestJS patterns
- Validation/guard usage (or absence)
- Token/credential configuration notes

### 11) Configuration and environment variables

4-column markdown table:

| Variable | Required | Default/example | Purpose |
| -------- | -------- | --------------- | ------- |

- Mark conditional requirements as `Yes (GraphQL)`, `Yes (gRPC)`, `Yes (if X enabled)`, or `Optional`
- Show realistic default or example values
- Close with: `For a complete template, see apps/<service-name>/.env.example.`

### 12) Observability

Four subsections: **Logging**, **Health checks**, **Metrics**, **Tracing**

- Logging: library used, config module, log levels
- Health checks: list HTTP endpoints (`/health`, `/health/live`, `/health/ready`) and gRPC health service; note readiness indicators
- Metrics: note if present or absent ("no dedicated metrics exporter found")
- Tracing: note if present or absent

### 13) Error handling strategy

Bullet list:

- Where errors are thrown (command processors, guards)
- Error class hierarchy used (`ApplicationError`, `SystemError`, etc.)
- Where integration failures are logged
- Transport-specific error mapping (GraphQL exceptions, gRPC status codes)

### 14) How to extend

Three subsections with **numbered steps**:

**Add a new module**
1-5 steps: create folder, add use-case module, add processors, add transport adapter, import in runtime module.

**Add a new endpoint/operation**
Transport-specific sub-bullets for GraphQL and gRPC steps, each following contract-first order.

**Add a new integration client**
Steps: create adapter, register in client-services, add to GrpcClientModule, add resilience policies.

### 15) Testing strategy

Short section:

- List existing test files with relative paths
- Describe test scope (unit / integration / E2E)
- Note what is not covered

### 16) Known runtime constraints

Bullet list of real limitations:

- Schema/code mismatches
- Incomplete implementations (mocked returns, missing transactions)
- Missing validation, missing error mapping
- Technical debt flagged for future work

### 17) Related packages/apps in monorepo

Bullet list. Format per item:

```
- `apps/<name>` or `packages/<name>` - one-line description of the relationship
```

---

## Formatting rules

- **Tables** only in section 11 (env vars). Use bullet lists everywhere else.
- **Numbered lists** only for step-by-step flows (sections 4, 7, 14).
- **Backtick** all file paths, class names, method names, env var names, module names.
- **Bold** subsection labels inside sections (e.g., `### In scope` → use `###` heading or `**In scope**` bold).
- No code blocks with actual runnable code — reference file paths instead.
- Write in technical, precise, imperative tone. Acknowledge gaps honestly.
- Keep section 6 source-of-truth oriented: paths, not duplicated operation catalogs.
- **No endpoint paths in the README** — never list specific URL paths (e.g., `/:app_type/register`); these belong in controller code, not documentation.
- **No package behavior descriptions** — do not explain how shared packages (`packages/nest-shared`, `packages/utils`, etc.) work internally; only state what they provide to this service.

---

## Checklist before writing

- [ ] Read `src/*.main.ts` files (entrypoints + bootstrap)
- [ ] Read `src/*.module.ts` files (composition)
- [ ] Read `src/shared/shared.module.ts`
- [ ] Read entities in `src/shared/domain/entities/*`
- [ ] Read repositories in `src/shared/domain/repositories/*`
- [ ] Read resolvers/controllers under `src/*/graphql/*` and `src/*/grpc/*`
- [ ] Read `.env.example`
- [ ] Check `packages/grpc/protobufs/*.proto` for gRPC contracts
- [ ] Check `packages/graphql/definitions/src/*` for GraphQL contracts
- [ ] Read existing `README.md` if updating (preserve sections not fully covered)
