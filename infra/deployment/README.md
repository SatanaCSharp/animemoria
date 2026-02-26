# Deployment

Infrastructure for deploying AniMemoria microservices via Docker and Kubernetes (Helm + Kustomize).

## Directory Structure

```
infra/deployment/
├── docker/
│   ├── Dockerfile.nestjs        # Multi-stage NestJS build
│   ├── Dockerfile.vite          # Vite + Nginx build (admin dashboard)
│   ├── Dockerfile.nextjs        # Next.js standalone build
│   ├── nginx.conf               # Nginx config for Vite apps
│   ├── .dockerignore
│   └── scripts/                 # Build-time helpers
│       ├── setup-app-user.sh        # Creates non-root user for NestJS containers
│       ├── setup-nginx-user.sh      # Creates non-root nginx user for Vite containers
│       ├── cleanup-node-modules.sh  # Strips source maps, docs, test files from node_modules
│       └── cleanup-build-artifacts.sh # Removes *.map files and test artifacts post-build
│
└── kubernetes/
    ├── helm/
    │   ├── charts/
    │   │   ├── microservice/    # Universal Helm chart for NestJS services
    │   │   │   ├── Chart.yaml
    │   │   │   ├── values.yaml
    │   │   │   └── templates/   # Deployment, Service, Ingress, HPA, PDB, NetworkPolicy
    │   │   └── frontend/        # Helm chart for frontend apps (Vite/React + Nginx)
    │   │       ├── Chart.yaml
    │   │       ├── values.yaml
    │   │       └── templates/   # Deployment, Service, Ingress, HPA, PDB, NetworkPolicy
    │   └── values/
    │       ├── cluster.yaml              # Global: imageRepository, knownServices port map
    │       ├── aws.yaml                  # AWS override: enables CSI secrets volume
    │       ├── admin/                    # admin.yaml (frontend)
    │       ├── auth-service/             # auth-service-graphql.yaml, auth-service-grpc.yaml
    │       ├── users-service/            # users-service-graphql.yaml, users-service-grpc.yaml
    │       ├── api-gateway-service/      # api-gateway-service-graphql.yaml, api-gateway-service-rest.yaml
    │       └── registry-service/         # registry-service-rest.yaml
    │
    └── manifests/               # Kustomize overlays
        ├── base/                # Base Ingress for api-gateway
        ├── minikube/            # Local: nginx ingress + create-secrets.sh
        └── aws/                 # Production: ALB ingress + SecretProviderClass (CSI)
```

## Architecture Overview

### Services and Helm Releases

Each NestJS service is deployed as multiple Helm releases (one per entrypoint):

| Helm Release                  | Service             | Protocol | Container Port | Service Port |
| ----------------------------- | ------------------- | -------- | -------------- | ------------ |
| `registry-service-rest`       | registry-service    | HTTP     | 3000           | 80           |
| `auth-service-graphql`        | auth-service        | HTTP     | 3000           | 80           |
| `auth-service-grpc`           | auth-service        | gRPC     | 5000           | 5000         |
| `users-service-graphql`       | users-service       | HTTP     | 3000           | 80           |
| `users-service-grpc`          | users-service       | gRPC     | 5000           | 5000         |
| `api-gateway-service-graphql` | api-gateway-service | HTTP     | 3000           | 80           |
| `api-gateway-service-rest`    | api-gateway-service | HTTP     | 3000           | 80           |

Frontend applications use a separate Helm chart (`charts/frontend`):

| Helm Release | Application | Runtime | Container Port | Service Port |
| ------------ | ----------- | ------- | -------------- | ------------ |
| `admin`      | admin       | Nginx   | 80             | 80           |

### Deployment Order

Services must be deployed in dependency order:

```
1. registry-service-rest       (no dependencies)
2. users-service-grpc          (depends on: registry-service-rest)
3. auth-service-grpc           (depends on: users-service-grpc, registry-service-rest)
4. users-service-graphql       (depends on: users-service-grpc)
5. auth-service-graphql        (depends on: auth-service-grpc)
6. api-gateway-service-graphql (depends on: users-service-graphql, auth-service-graphql)
7. api-gateway-service-rest    (depends on: api-gateway-service-graphql)
8. admin                       (no backend dependencies, can deploy anytime)
```

Init containers block until dependencies are reachable (DNS + TCP check). Frontend apps (like admin) serve static files and have no runtime backend dependencies.

### Configuration Layers

The deployment merges three configuration sources into a single `.env` file at `/etc/app/config/.env` (via init container):

| Layer              | Source                                    | Content                                | Priority |
| ------------------ | ----------------------------------------- | -------------------------------------- | -------- |
| **Shared config**  | `global-shared-config` ConfigMap          | `NODE_ENV`, `LOG_LEVEL`, `LOG_PRETTY`  | Lowest   |
| **Service config** | Optional per-service ConfigMap            | Service-specific non-secret config     | Medium   |
| **Secrets**        | K8s Secret (minikube) or CSI volume (AWS) | `DB_CONNECTION_URL`, JWT secrets, etc. | Highest  |

Additionally, connectivity vars (URLs, ports) are injected as container `env` from Helm values, which **always override** values from the `.env` file.

### Environment Variable Classification

| Category          | Variables                                                                        | K8s Source                       | Local Dev Source |
| ----------------- | -------------------------------------------------------------------------------- | -------------------------------- | ---------------- |
| **Bind ports**    | `APP_GRAPHQL_PORT`, `APP_REST_PORT`, `APP_GRPC_PORT`                             | Helm (auto from template)        | `.env` file      |
| **Connectivity**  | `*_SERVICE_GRAPHQL_URL`, `*_SERVICE_GRPC_URL`, `INTERNAL_REGISTRY_SERVER_HOST`   | Helm `env` values                | `.env` file      |
| **Shared config** | `NODE_ENV`, `LOG_LEVEL`, `LOG_PRETTY`                                            | `global-shared-config` ConfigMap | `.env` file      |
| **Secrets**       | `DB_CONNECTION_URL`, `AT_SECRET`, `RT_SECRET`, `COOKIES_MAX_AGE`, `CORS_ORIGINS` | K8s Secret or CSI                | `.env` file      |

This separation ensures no port conflicts between environments. Container `env` (Helm-managed) overrides `.env` file values, so local dev `.env` files can keep their dev ports without affecting K8s deployments.

---

## Docker Builds

Build images using pnpm scripts from the repository root:

```bash
# Frontend
pnpm docker:build:admin                  # Vite app via Nginx

# NestJS services (each entrypoint = separate image)
pnpm docker:build:auth:graphql           # auth-service graphql entrypoint
pnpm docker:build:auth:grpc              # auth-service grpc entrypoint
pnpm docker:build:users:graphql          # users-service graphql entrypoint
pnpm docker:build:users:grpc             # users-service grpc entrypoint
pnpm docker:build:api-gateway:graphql    # api-gateway graphql entrypoint
pnpm docker:build:api-gateway:rest       # api-gateway rest entrypoint
pnpm docker:build:registry               # registry-service rest entrypoint

# Build everything
pnpm docker:build:all
```

### Dockerfile Overview

| Dockerfile          | Runtime      | Description                                                     |
| ------------------- | ------------ | --------------------------------------------------------------- |
| `Dockerfile.nestjs` | Node Alpine  | 6-stage build: base → stubs → deps → builder → deploy → runtime |
| `Dockerfile.vite`   | Nginx Alpine | 5-stage build: base → filter → deps → builder → runtime         |
| `Dockerfile.nextjs` | Node Alpine  | 4-stage build: base → deps → builder → runtime (standalone)     |

All images run as non-root users (created by `scripts/setup-app-user.sh` or `scripts/setup-nginx-user.sh`) and have node_modules stripped of dev artifacts for smaller image size.

---

## Deploying to Minikube

### Prerequisites

- [minikube](https://minikube.sigs.k8s.io/) installed
- [Helm](https://helm.sh/) v3 installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- PostgreSQL database accessible from minikube (external or in-cluster)

### Step 1: Start minikube

```bash
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
```

### Step 2: Build images into minikube's Docker daemon

Point your Docker CLI to minikube's daemon so images are available without a registry:

```bash
eval $(minikube docker-env)
```

Then build all images (see [Docker Builds](#docker-builds) above). Run all 7 NestJS builds.

### Step 3: Apply Kustomize overlay

This creates the base Ingress with nginx class:

```bash
kubectl apply -k infra/deployment/kubernetes/manifests/minikube/
```

### Step 4: Create secrets from .env files

The script reads `.env` files directly from `apps/*-service/.env` — the same files used for local development. Ensure each service has a `.env` file (copy from `.env.example` and fill in real values):

```bash
cp apps/auth-service/.env.example apps/auth-service/.env
cp apps/users-service/.env.example apps/users-service/.env
cp apps/api-gateway-service/.env.example apps/api-gateway-service/.env
cp apps/registry-service/.env.example apps/registry-service/.env
# Edit each .env with actual values (DB credentials, JWT secrets, etc.)
```

Then run the helper script:

```bash
./infra/deployment/kubernetes/manifests/minikube/create-secrets.sh
```

The `.env` files may contain connectivity vars (URLs, ports) alongside secrets — that's fine. Helm container `env` overrides those at runtime, so only the actual secrets matter in K8s.

The script creates K8s Secrets for each Helm release:

- `apps/auth-service/.env` -> `auth-graphql-service-config`, `auth-grpc-service-config`
- `apps/users-service/.env` -> `users-graphql-service-config`, `users-grpc-service-config`
- `apps/api-gateway-service/.env` -> `api-gateway-graphql-service-config`, `api-gateway-rest-service-config`
- `apps/registry-service/.env` -> `registry-service-config`

### Step 5: Deploy services with Helm

Export the path variables first — both must be set in the same shell session before running `helm install`:

```bash
export CHART=infra/deployment/kubernetes/helm/charts/microservice
export VALUES=infra/deployment/kubernetes/helm/values
```

Deploy in dependency order:

```bash
# 1. Registry (creates global-shared-config ConfigMap)
helm install registry-service-rest $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/registry-service/registry-service-rest.yaml \
  --set image.pullPolicy=Never

# 2. Users gRPC
helm install users-service-grpc $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/users-service/users-service-grpc.yaml \
  --set image.pullPolicy=Never

# 3. Auth gRPC
helm install auth-service-grpc $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/auth-service/auth-service-grpc.yaml \
  --set image.pullPolicy=Never

# 4. Users GraphQL
helm install users-service-graphql $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/users-service/users-service-graphql.yaml \
  --set image.pullPolicy=Never

# 5. Auth GraphQL
helm install auth-service-graphql $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/auth-service/auth-service-graphql.yaml \
  --set image.pullPolicy=Never

# 6. API Gateway GraphQL
helm install api-gateway-service-graphql $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/api-gateway-service/api-gateway-service-graphql.yaml \
  --set image.pullPolicy=Never

# 7. API Gateway REST
helm install api-gateway-service-rest $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/api-gateway-service/api-gateway-service-rest.yaml \
  --set image.pullPolicy=Never

# 8. Admin Dashboard (uses frontend chart)
export FRONTEND_CHART=infra/deployment/kubernetes/helm/charts/frontend
helm install admin $FRONTEND_CHART \
  -f $VALUES/admin/admin.yaml \
  --set image.pullPolicy=Never \
  --set ingress.className=nginx \
  --set ingress.host=admin.animemoria.local
```

**Note:**

Using `docker-env` switching, means you directly build Docker images in Minikube, and they become cached inside Minikube.
To load new image use the following:

```bash
#1 build docker image
pnpm run docker:build:api:gateway:rest # or any other build command

#2 uninstall deployment using helm
helm uninstall api-gateway-service-rest

#3 load image into minikube
minikube image load api-gateway-rest:latest

#4 install deployment
helm install api-gateway-service-rest $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/api-gateway-service/api-gateway-service-rest.yaml \
  --set image.pullPolicy=Never
```

### Step 6: Configure DNS and access in browser

Ingress routes by **hostname** (Host header). Use the hostname in the URL, not the IP.

**If the minikube node IP is not reachable from your machine** (e.g. Docker driver on Mac):

```bash
# Resolve hostnames to localhost
echo "127.0.0.1 api.animemoria.local admin.animemoria.local" | sudo tee -a /etc/hosts
```

Expose ingress on localhost (run in a separate terminal, keep it open). Choose one:

- **No port in URL** — bind to port 80 (requires one-time sudo):

  ```bash
  sudo kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 80:80
  ```

  Then open **http://admin.animemoria.local/** and **http://api.animemoria.local/graphql**.

- **No sudo** — use a non-privileged port:
  ```bash
  kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80
  ```
  Then open **http://admin.animemoria.local:8080/** and **http://api.animemoria.local:8080/graphql**.

**If the minikube node IP is reachable:**

```bash
echo "$(minikube ip) api.animemoria.local admin.animemoria.local" | sudo tee -a /etc/hosts
# Use the ingress NodePort in the URL, e.g. http://admin.animemoria.local:30650/
# Get port: kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.spec.ports[0].nodePort}'
```

### Step 7: Verify

```bash
# Check all pods are running
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# Test the API (omit :8080 if you used sudo port-forward on 80; use :<nodePort> if using NodePort)
curl http://api.animemoria.local/graphql
curl http://api.animemoria.local/api/v1

# Test admin dashboard
curl http://admin.animemoria.local/
```

### Upgrading a service

After rebuilding an image (requires `$CHART` and `$VALUES` to be exported — see Step 5):

```bash
helm upgrade auth-service-graphql $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/auth-service/auth-service-graphql.yaml \
  --set image.pullPolicy=Never
```

### Updating secrets

Re-run the create-secrets script after editing the `apps/*-service/.env` files:

```bash
./infra/deployment/kubernetes/manifests/minikube/create-secrets.sh
```

Then restart affected pods to pick up the new secrets:

```bash
kubectl rollout restart deployment auth-graphql auth-grpc
```

### Tearing down

```bash
helm uninstall admin api-gateway-service-rest api-gateway-service-graphql auth-service-graphql users-service-graphql auth-service-grpc users-service-grpc registry-service-rest
kubectl delete -k infra/deployment/kubernetes/manifests/minikube/
minikube stop
```

---

## Deploying to AWS (EKS)

### Prerequisites

- EKS cluster with [AWS Secrets Store CSI Driver](https://docs.aws.amazon.com/secretsmanager/latest/userguide/integrating_csi_driver.html) installed
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/) installed
- IRSA configured with `secretsmanager:GetSecretValue` permission
- Secrets created in AWS Secrets Manager as JSON objects:
  - `animemoria/auth-service` — `{ "DB_CONNECTION_URL": "...", "AT_SECRET": "...", "RT_SECRET": "...", "COOKIES_MAX_AGE": "..." }`
  - `animemoria/users-service` — `{ "DB_CONNECTION_URL": "..." }`
  - `animemoria/api-gateway-service` — `{ "AT_SECRET": "...", "RT_SECRET": "...", "COOKIES_MAX_AGE": "...", "CORS_ORIGINS": "..." }`
  - `animemoria/registry-service` — `{}` (empty or omit)
- ACM certificate for `api.animemoria.com`

### Deploy

```bash
# 1. Update the ACM certificate ARN in the ingress patch
#    Edit: manifests/aws/ingress-patch.yaml
#    Replace ${ACM_CERT_ARN} with your actual certificate ARN

# 2. Apply Kustomize overlay (Ingress + SecretProviderClass resources)
kubectl apply -k infra/deployment/kubernetes/manifests/aws/

# 3. Deploy services (same order as minikube, but with aws.yaml overlay)
CHART=infra/deployment/kubernetes/helm/charts/microservice
VALUES=infra/deployment/kubernetes/helm/values

helm install registry $CHART \
  -f $VALUES/cluster.yaml \
  -f $VALUES/aws.yaml \
  -f $VALUES/registry-service/registry-service-rest.yaml \
  --set imageRepository=<your-ecr-registry>

# ... repeat for all services in dependency order
# Always include: -f $VALUES/cluster.yaml -f $VALUES/aws.yaml -f $VALUES/<service-name>/<service-name>-<app-type>.yaml
```

The `aws.yaml` overlay switches `secretsVolume.type` to `csi`, so secrets are mounted directly from AWS Secrets Manager via the CSI driver — no K8s Secrets stored in etcd.

---

## Helm Chart Reference

### Microservice Chart (charts/microservice)

For NestJS backend services with config/secret management.

#### Key Values

| Value                                   | Default    | Description                                                                    |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| `imageRepository`                       | `""`       | Container registry URL (set via `cluster.yaml` or `--set`)                     |
| `image.name`                            | `app-name` | Docker image name (e.g., `auth-service`)                                       |
| `image.tag`                             | `latest`   | Image tag                                                                      |
| `image.pullPolicy`                      | `Always`   | Use `Never` for minikube with local images                                     |
| `protocol`                              | `http`     | `http` or `grpc` — drives port conventions                                     |
| `portEnvKey`                            | auto       | Override port env var name (e.g., `APP_GRAPHQL_PORT`)                          |
| `component`                             | `""`       | `gateway`, `graphql`, `grpc`, or `registry` — used in labels and NetworkPolicy |
| `command`                               | `[]`       | Container entrypoint override (e.g., `["node", "dist/grpc.main"]`)             |
| `dependencies`                          | `[]`       | Services to wait for before starting (init container)                          |
| `env`                                   | `[]`       | Non-sensitive env vars (connectivity URLs, app name)                           |
| `secretKeys`                            | `[]`       | Required secret key names (documentation)                                      |
| `existingSecret`                        | `""`       | K8s Secret name for the secrets volume                                         |
| `secretsVolume.type`                    | `secret`   | `secret` (K8s Secret) or `csi` (AWS CSI Driver)                                |
| `secretsVolume.csi.secretProviderClass` | `""`       | SecretProviderClass name (when type=csi)                                       |
| `sharedConfigMap.create`                | `false`    | Set `true` on registry release only                                            |
| `replicaCount`                          | `1`        | Pod replicas (ignored when HPA enabled)                                        |
| `autoscaling.enabled`                   | `false`    | Enable Horizontal Pod Autoscaler                                               |
| `pdb.enabled`                           | `false`    | Enable Pod Disruption Budget                                                   |
| `networkPolicy.enabled`                 | `false`    | Enable NetworkPolicy                                                           |
| `ingress.enabled`                       | `false`    | Enable Ingress (api-gateway releases only)                                     |

#### Port Conventions

| Protocol | Container Port | Service Port | Port Env Var                               |
| -------- | -------------- | ------------ | ------------------------------------------ |
| `http`   | 3000           | 80           | `APP_PORT` (or override with `portEnvKey`) |
| `grpc`   | 5000           | 5000         | `APP_GRPC_PORT`                            |

#### Health Checks

| Protocol | Liveness                 | Readiness                |
| -------- | ------------------------ | ------------------------ |
| HTTP     | `GET /health/live`       | `GET /health/ready`      |
| gRPC     | Native gRPC health check | Native gRPC health check |

#### Helm Install Pattern

```bash
helm install <release-name> charts/microservice \
  -f values/cluster.yaml \
  [-f values/aws.yaml]                           # AWS only
  -f values/<service-name>/<service-name>-<app-type>.yaml \
  [--set imageRepository=<registry>]              # if not in cluster.yaml
  [--set image.pullPolicy=Never]                  # minikube only
```

---

### Frontend Chart (charts/frontend)

For static HTML/JS applications served via Nginx.

#### Key Values

| Value              | Default                              | Description                                     |
| ------------------ | ------------------------------------ | ----------------------------------------------- |
| `imageRepository`  | `""`                                 | Container registry URL                          |
| `image.name`       | `admin`                              | Docker image name                               |
| `image.tag`        | `latest`                             | Image tag                                       |
| `image.pullPolicy` | `Always`                             | Use `Never` for minikube                        |
| `apiGatewayUrl`    | `http://api-gateway-graphql/graphql` | GraphQL endpoint (injected as `window.__ENV__`) |
| `ingress.enabled`  | `false`                              | Enable Ingress                                  |
| `ingress.host`     | `""`                                 | Ingress hostname                                |

#### Helm Install Pattern

```bash
helm install admin charts/frontend \
  -f values/admin/admin.yaml \
  [--set imageRepository=<registry>]     # if using remote registry
  [--set image.pullPolicy=Never]         # minikube only
  [--set ingress.className=nginx]        # minikube
  [--set ingress.host=admin.local]       # set ingress host
```
