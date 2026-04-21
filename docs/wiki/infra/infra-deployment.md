---
updated: 2026-04-21
sources: [docs/raw/infra-deployment.md, .claude/rules/infra.md]
tags: [infra, kubernetes, helm, docker, deployment]
---

# infra-deployment

Deployment infrastructure for AniMemoria: multi-stage Docker builds, a universal Helm chart for NestJS microservices, a separate Helm chart for frontend apps, and Kustomize overlays for minikube and AWS EKS.

## Directory Structure

```
infra/deployment/
├── docker/
│   ├── Dockerfile.nestjs        # 6-stage Node Alpine build
│   ├── Dockerfile.vite          # 5-stage Nginx Alpine build (admin)
│   ├── Dockerfile.nextjs        # 4-stage Node Alpine standalone build
│   ├── nginx.conf
│   ├── .dockerignore
│   └── scripts/
│       ├── setup-app-user.sh
│       ├── setup-nginx-user.sh
│       ├── cleanup-node-modules.sh
│       └── cleanup-build-artifacts.sh
└── kubernetes/
    ├── helm/
    │   ├── charts/
    │   │   ├── microservice/    # Universal NestJS chart
    │   │   └── frontend/        # Nginx static-file chart
    │   └── values/
    │       ├── cluster.yaml              # Global: imageRepository, knownServices port map
    │       ├── aws.yaml                  # AWS override: enables CSI secrets volume
    │       ├── admin/
    │       ├── auth-service/
    │       ├── users-service/
    │       ├── api-gateway-service/
    │       └── registry-service/
    └── manifests/
        ├── base/        # Base Ingress for api-gateway
        ├── minikube/    # nginx ingress + create-secrets.sh
        └── aws/         # ALB ingress + SecretProviderClass (CSI)
```

## Helm Releases

Each NestJS service produces one Helm release per entrypoint:

| Helm Release                  | Service             | Protocol | Container Port | Service Port |
| ----------------------------- | ------------------- | -------- | -------------- | ------------ |
| `registry-service-rest`       | registry-service    | HTTP     | 3000           | 80           |
| `auth-service-graphql`        | auth-service        | HTTP     | 3000           | 80           |
| `auth-service-grpc`           | auth-service        | gRPC     | 5000           | 5000         |
| `users-service-graphql`       | users-service       | HTTP     | 3000           | 80           |
| `users-service-grpc`          | users-service       | gRPC     | 5000           | 5000         |
| `api-gateway-service-graphql` | api-gateway-service | HTTP     | 3000           | 80           |
| `api-gateway-service-rest`    | api-gateway-service | HTTP     | 3000           | 80           |
| `admin`                       | admin               | Nginx    | 80             | 80           |

`admin` uses `charts/frontend`; all NestJS services use `charts/microservice`.

## Deployment Order

Init containers block until dependencies are reachable (DNS + TCP check):

```
1. registry-service-rest
2. users-service-grpc          (depends on: registry-service-rest)
3. auth-service-grpc           (depends on: users-service-grpc, registry-service-rest)
4. users-service-graphql       (depends on: users-service-grpc)
5. auth-service-graphql        (depends on: auth-service-grpc)
6. api-gateway-service-graphql (depends on: users-service-graphql, auth-service-graphql)
7. api-gateway-service-rest    (depends on: api-gateway-service-graphql)
8. admin                       (no backend dependencies)
```

## Configuration Layers

The microservice chart merges three sources into `/etc/app/config/.env` (via init container):

| Layer          | Source                           | Content                               | Priority |
| -------------- | -------------------------------- | ------------------------------------- | -------- |
| Shared config  | `global-shared-config` ConfigMap | `NODE_ENV`, `LOG_LEVEL`, `LOG_PRETTY` | Lowest   |
| Service config | Per-service ConfigMap (optional) | Non-secret service config             | Medium   |
| Secrets        | K8s Secret or CSI volume         | `DB_CONNECTION_URL`, JWT secrets      | Highest  |

Connectivity vars injected via Helm container `env` **always override** `.env` file values — so local dev `.env` files don't cause port conflicts in K8s.

### Environment Variable Categories

| Category      | Variables                                                            | K8s Source                |
| ------------- | -------------------------------------------------------------------- | ------------------------- |
| Bind ports    | `APP_GRAPHQL_PORT`, `APP_REST_PORT`, `APP_GRPC_PORT`                 | Helm (auto from template) |
| Connectivity  | `*_SERVICE_GRAPHQL_URL`, `*_SERVICE_GRPC_URL`, `INTERNAL_REGISTRY_*` | Helm `env` values         |
| Shared config | `NODE_ENV`, `LOG_LEVEL`, `LOG_PRETTY`                                | `global-shared-config`    |
| Secrets       | `DB_CONNECTION_URL`, `AT_SECRET`, `RT_SECRET`, `COOKIES_MAX_AGE`     | K8s Secret or CSI         |

## Docker Builds

Build from the repository root:

```bash
pnpm docker:build:admin                  # Vite → Nginx
pnpm docker:build:auth:graphql
pnpm docker:build:auth:grpc
pnpm docker:build:users:graphql
pnpm docker:build:users:grpc
pnpm docker:build:api-gateway:graphql
pnpm docker:build:api-gateway:rest
pnpm docker:build:registry
pnpm docker:build:all                    # all of the above
```

All images run as non-root users. Node modules are stripped of dev artifacts (source maps, test files) to reduce image size.

## Minikube Deployment

### Quick Start

```bash
# 1. Start cluster
minikube start --cpus=4 --memory=8192
minikube addons enable ingress

# 2. Point Docker CLI to minikube daemon and build images
eval $(minikube docker-env)
pnpm docker:build:all

# 3. Apply Kustomize overlay (nginx Ingress)
kubectl apply -k infra/deployment/kubernetes/manifests/minikube/

# 4. Populate .env files from .env.example for each service, then:
./infra/deployment/kubernetes/manifests/minikube/create-secrets.sh

# 5. Export paths (required for all helm commands)
export CHART=infra/deployment/kubernetes/helm/charts/microservice
export VALUES=infra/deployment/kubernetes/helm/values

# 6. Deploy in order (see Deployment Order above)
helm upgrade --install registry-service-rest $CHART \
  -f $VALUES/cluster.yaml -f $VALUES/registry-service/registry-service-rest.yaml \
  --set image.pullPolicy=Never
# ... repeat for remaining releases

# 7. DNS
echo "127.0.0.1 api.animemoria.local admin.animemoria.local" | sudo tee -a /etc/hosts
sudo kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 80:80
```

### Refreshing a Single Image

When using `docker-env`, images are cached inside minikube. To update one:

```bash
pnpm run docker:build:<service>          # rebuild
helm uninstall <release-name>            # remove old release
minikube image load <image>:latest       # load new image
helm upgrade --install <release-name> $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/<service>/<values-file>.yaml \
  --set image.pullPolicy=Never
```

### Secrets

The `create-secrets.sh` script reads each `apps/*-service/.env` and creates K8s Secrets for every Helm release. Connectivity vars in those files are safe to include — Helm `env` overrides them at runtime.

Mappings:

- `apps/auth-service/.env` → `auth-graphql-service-config`, `auth-grpc-service-config`
- `apps/users-service/.env` → `users-graphql-service-config`, `users-grpc-service-config`
- `apps/api-gateway-service/.env` → `api-gateway-graphql-service-config`, `api-gateway-rest-service-config`
- `apps/registry-service/.env` → `registry-service-config`

To rotate secrets: edit `.env` files → re-run `create-secrets.sh` → `kubectl rollout restart deployment <name>`.

### Teardown

```bash
helm uninstall admin api-gateway-service-rest api-gateway-service-graphql \
  auth-service-graphql users-service-graphql auth-service-grpc \
  users-service-grpc registry-service-rest
kubectl delete -k infra/deployment/kubernetes/manifests/minikube/
minikube stop
```

## AWS EKS Deployment

### Prerequisites

- EKS cluster with AWS Secrets Store CSI Driver and AWS Load Balancer Controller
- IRSA role with `secretsmanager:GetSecretValue`
- Secrets in AWS Secrets Manager:
  - `animemoria/auth-service`: `DB_CONNECTION_URL`, `AT_SECRET`, `RT_SECRET`, `COOKIES_MAX_AGE`
  - `animemoria/users-service`: `DB_CONNECTION_URL`
  - `animemoria/api-gateway-service`: `AT_SECRET`, `RT_SECRET`, `COOKIES_MAX_AGE`, `CORS_ORIGINS`
  - `animemoria/registry-service`: (empty or omit)
- ACM certificate for `api.animemoria.com`

### Deploy

```bash
# 1. Update ACM cert ARN in manifests/aws/ingress-patch.yaml
# 2. Apply Kustomize overlay
kubectl apply -k infra/deployment/kubernetes/manifests/aws/

# 3. Deploy (same order as minikube, add aws.yaml overlay)
CHART=infra/deployment/kubernetes/helm/charts/microservice
VALUES=infra/deployment/kubernetes/helm/values

helm upgrade --install registry $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/aws.yaml \
  -f $VALUES/registry-service/registry-service-rest.yaml \
  --set imageRepository=<ecr-registry>
# ... repeat for remaining services
```

`aws.yaml` sets `secretsVolume.type=csi`, routing secrets through the CSI driver — no K8s Secrets stored in etcd.

## Helm Chart Reference

### charts/microservice — Key Values

| Value                    | Default  | Notes                                                       |
| ------------------------ | -------- | ----------------------------------------------------------- |
| `protocol`               | `http`   | `http` or `grpc` — drives port and health check conventions |
| `component`              | `""`     | `gateway`, `graphql`, `grpc`, `registry` — used in labels   |
| `command`                | `[]`     | Entrypoint override (e.g. `["node","dist/grpc.main"]`)      |
| `dependencies`           | `[]`     | Init-container DNS+TCP checks before startup                |
| `secretsVolume.type`     | `secret` | `secret` (K8s) or `csi` (AWS)                               |
| `sharedConfigMap.create` | `false`  | Set `true` only on `registry-service-rest`                  |
| `migration.enabled`      | `false`  | Runs `pnpm migration:run:prod` Job on install/upgrade       |
| `autoscaling.enabled`    | `false`  | HPA                                                         |
| `pdb.enabled`            | `false`  | PodDisruptionBudget                                         |
| `networkPolicy.enabled`  | `false`  | NetworkPolicy                                               |

Port conventions:

| Protocol | Container Port | Service Port | Port Env Var    |
| -------- | -------------- | ------------ | --------------- |
| `http`   | 3000           | 80           | `APP_PORT`      |
| `grpc`   | 5000           | 5000         | `APP_GRPC_PORT` |

Health checks:

- HTTP: `GET /health/live` (liveness), `GET /health/ready` (readiness)
- gRPC: native gRPC health check

### charts/frontend — Key Values

| Value           | Default                              | Notes                                   |
| --------------- | ------------------------------------ | --------------------------------------- |
| `apiGatewayUrl` | `http://api-gateway-graphql/graphql` | Injected as `window.__ENV__` at runtime |
| `ingress.host`  | `""`                                 | Hostname for the Ingress rule           |

## Related

- [[registry-service]] — must be first release; creates `global-shared-config` ConfigMap
- [[api-gateway-service]] — only service with Ingress enabled
- [[users-service]] — dual-release (graphql + grpc)
- [[auth-service]] — dual-release (graphql + grpc)
