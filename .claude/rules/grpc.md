---
globs: ['packages/grpc/**']
---

# gRPC / Protobuf conventions

## Proto authoring

- One `.proto` file per service domain (e.g. `users.proto`, `auth.proto`).
- Use `proto3` syntax. All fields explicitly numbered and never renumbered once deployed.
- Deprecate fields with `[deprecated = true]` before removing — never delete a field from a live proto.

## Code generation

After any `.proto` change:

1. `pnpm proto:generate` — runs `ts-proto` and writes output into `packages/grpc/src/generated/`.
2. Rebuild affected packages: `pnpm --filter @packages/grpc build` and then rebuild consuming services.
3. Commit both the `.proto` change and the regenerated TypeScript in the same commit.

## ts-proto output

- Generated files are in `packages/grpc/src/generated/` — never edit them by hand.
- Import only from the package barrel (`@packages/grpc`) — not from deep generated paths.

## Reflection

- gRPC reflection is enabled via `@packages/nest-shared`. Confirm it is disabled in any production Helm values file before deploying.
