---
globs: ['infra/**']
---

# Infrastructure conventions

## Local dev

- PostgreSQL via `infra/local/docker-compose.yml` (postgres:16-alpine).
- Start with `docker compose -f infra/local/docker-compose.yml up -d`.

## Terraform (AWS)

- Entry point: `infra/aws-iac/`. Manages ECR repositories and IAM OIDC for GitHub Actions.
- Always run `terraform plan` and confirm output before `terraform apply`.
- State is remote — never run `terraform init` without the backend config flags.

## Kubernetes / Helm

Two charts under `infra/deployment/kubernetes/charts/`:

- `frontend/` — covers `apps/web` and `apps/admin`.
- `microservice/` — covers all NestJS services (gateway, users, auth, registry).

Per-service values files live in `values/<service-name>/`. Global overrides: `values/cluster.yaml`, `values/aws.yaml`.

When adding a new service:

1. Add a `values/<service-name>/` directory with at minimum `values.yaml`.
2. Reference the `microservice` chart — do not duplicate chart templates.
3. Add the service to the Turborepo pipeline in `turbo.json` if it has a build step.

## Dockerfiles

- Multi-stage builds. Build args: `NODE_VERSION` (must match `≥ 24`) and `PNPM_VERSION`.
- Final stage: `node:${NODE_VERSION}-alpine`. No dev dependencies in the final image.
- `COPY --chown=node:node` before switching to the `node` user.
