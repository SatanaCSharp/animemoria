# ECR Docker Build & Deploy Design

**Date:** 2026-04-09
**Branch:** feat/AM-45-master-merged-workflow
**Scope:** Add Docker image build, ECR push, and Helm upgrade steps to the CI/CD pipeline.

---

## Overview

On every merge to `master`, detect which workspaces changed (using the existing Turborepo change-detection), build only the affected Docker images, push them to Amazon ECR, and immediately upgrade the corresponding Helm releases in the EKS cluster.

A separate `workflow_dispatch` workflow allows manual build and deploy of any individual image or all images.

---

## Trigger Rules

| Event                                  | Behaviour                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| Push to `master`                       | Detect changes → quality-checks → tests → build+push+deploy (only changed images) |
| `workflow_dispatch` on merge workflow  | Full detect-changes → quality-checks → tests → build+push+deploy                  |
| `workflow_dispatch` on manual workflow | Skip quality/tests, build+push+deploy selected image(s) immediately               |
| PR to `master`                         | No Docker build/push (unchanged)                                                  |

**Cancellation:** All jobs are chained with `needs`, so cancelling the workflow run in the GitHub UI stops all in-flight jobs. If any test job fails, the build jobs are never scheduled (GitHub's default `success()` condition on `needs`).

---

## Package Dependency Propagation

No extra configuration needed. The existing change-detection uses:

```bash
npx turbo ls --filter="...[${BASE_REF}]" --targets='lint'
```

The `...` prefix tells Turbo to include all dependents transitively. If `@packages/nest-shared` changes, `users-service`, `auth-service`, etc. appear in the output matrix — the build jobs consume the same matrix, so their images are automatically rebuilt.

---

## New & Modified Files

### New files

| Path                                        | Purpose                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| `.github/build-matrix.json`                 | Static mapping: workspace name → Docker build configs + Helm release metadata |
| `.github/workflows/_build-and-push.yml`     | Reusable workflow: fan-out build+push+deploy per image                        |
| `.github/workflows/build-images-manual.yml` | Manual `workflow_dispatch` workflow with image selector                       |

### Modified files

| Path                                              | Change                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/actions/build-and-push-ecr/action.yml`   | Add `dockerfile`, `app-name`, `app-type`, `entry-point`, `ecr-repo`, `helm-release`, `helm-chart`, `helm-values`, `deploy`, `eks-cluster-name`, `image-tag` inputs; update `docker build` command to pass build args; add `aws eks update-kubeconfig` + `helm upgrade` steps |
| `.github/workflows/merge-pull-request.yml`        | Add `expand-build-matrix` job (cross-references changed workspaces with `build-matrix.json`) and `build-and-push` job (calls `_build-and-push.yml`, needs: `expand-build-matrix`)                                                                                            |
| `infra/aws-iac/modules/iam/ecr_push_policy.tf`    | Add `eks:DescribeCluster` permission to the GitHub Actions IAM role                                                                                                                                                                                                          |
| `infra/aws-iac/modules/iam/github_actions_ecr.tf` | Add EKS access entry granting the GitHub Actions IAM role cluster access for Helm                                                                                                                                                                                            |
| `infra/aws-iac/modules/ecr/variables.tf`          | Replace 2 generic repos with 9 per-image repos                                                                                                                                                                                                                               |

---

## ECR Repositories

Replaces `animemoria-backend` and `animemoria-frontend` with one repo per image:

```
registry-service-rest
users-service-graphql
users-service-grpc
auth-service-graphql
auth-service-grpc
api-gateway-service-graphql
api-gateway-service-rest
admin
web
```

Lifecycle policy (keep last 3 images) remains unchanged and applies to all repos.

---

## `build-matrix.json`

Single source of truth mapping each Turborepo workspace to its Docker build arguments and Helm release metadata. Build args mirror the `docker:build:*` scripts in `package.json` exactly.

```json
{
  "registry-service": [
    {
      "image": "registry-service-rest",
      "dockerfile": "Dockerfile.nestjs",
      "app_name": "registry-service",
      "app_type": "rest",
      "entry_point": "rest.main",
      "helm_release": "registry-service-rest",
      "helm_chart": "microservice",
      "helm_values": "registry-service/registry-service-rest.yaml",
      "deploy": true
    }
  ],
  "users-service": [
    {
      "image": "users-service-graphql",
      "dockerfile": "Dockerfile.nestjs",
      "app_name": "users-service",
      "app_type": "graphql",
      "entry_point": "graphql.main",
      "helm_release": "users-service-graphql",
      "helm_chart": "microservice",
      "helm_values": "users-service/users-service-graphql.yaml",
      "deploy": true
    },
    {
      "image": "users-service-grpc",
      "dockerfile": "Dockerfile.nestjs",
      "app_name": "users-service",
      "app_type": "grpc",
      "entry_point": "grpc.main",
      "helm_release": "users-service-grpc",
      "helm_chart": "microservice",
      "helm_values": "users-service/users-service-grpc.yaml",
      "deploy": true
    }
  ],
  "auth-service": [
    {
      "image": "auth-service-graphql",
      "dockerfile": "Dockerfile.nestjs",
      "app_name": "auth-service",
      "app_type": "graphql",
      "entry_point": "graphql.main",
      "helm_release": "auth-service-graphql",
      "helm_chart": "microservice",
      "helm_values": "auth-service/auth-service-graphql.yaml",
      "deploy": true
    },
    {
      "image": "auth-service-grpc",
      "dockerfile": "Dockerfile.nestjs",
      "app_name": "auth-service",
      "app_type": "grpc",
      "entry_point": "grpc.main",
      "helm_release": "auth-service-grpc",
      "helm_chart": "microservice",
      "helm_values": "auth-service/auth-service-grpc.yaml",
      "deploy": true
    }
  ],
  "api-gateway-service": [
    {
      "image": "api-gateway-service-graphql",
      "dockerfile": "Dockerfile.nestjs",
      "app_name": "api-gateway-service",
      "app_type": "graphql",
      "entry_point": "graphql.main",
      "helm_release": "api-gateway-service-graphql",
      "helm_chart": "microservice",
      "helm_values": "api-gateway-service/api-gateway-service-graphql.yaml",
      "deploy": true
    },
    {
      "image": "api-gateway-service-rest",
      "dockerfile": "Dockerfile.nestjs",
      "app_name": "api-gateway-service",
      "app_type": "rest",
      "entry_point": "rest.main",
      "helm_release": "api-gateway-service-rest",
      "helm_chart": "microservice",
      "helm_values": "api-gateway-service/api-gateway-service-rest.yaml",
      "deploy": true
    }
  ],
  "admin": [
    {
      "image": "admin",
      "dockerfile": "Dockerfile.vite",
      "app_name": "admin",
      "app_type": null,
      "entry_point": null,
      "helm_release": "admin",
      "helm_chart": "frontend",
      "helm_values": "admin/admin.yaml",
      "deploy": true
    }
  ],
  "web": [
    {
      "image": "web",
      "dockerfile": "Dockerfile.nextjs",
      "app_name": "web",
      "app_type": null,
      "entry_point": null,
      "helm_release": null,
      "helm_chart": null,
      "helm_values": null,
      "deploy": false
    }
  ]
}
```

---

## Workflow Data Flow (merge to master)

```
push to master
│
├─ detect-changes           outputs: matrix=["users-service","auth-service"]
│
├─ quality-checks           needs: detect-changes
│
├─ tests                    needs: detect-changes, quality-checks
│   └─ if any fail → all downstream jobs skipped
│
├─ expand-build-matrix      needs: detect-changes, tests
│   script reads build-matrix.json, filters to changed workspaces,
│   flattens to image list:
│   [
│     { image: "users-service-graphql", ... },
│     { image: "users-service-grpc",    ... },
│     { image: "auth-service-graphql",  ... },
│     { image: "auth-service-grpc",     ... }
│   ]
│   outputs: build_matrix (JSON)
│
└─ _build-and-push.yml      needs: expand-build-matrix
    strategy.matrix: ${{ fromJson(needs.expand-build-matrix.outputs.build_matrix) }}
    (4 parallel jobs, one per image)
    │
    each job:
    ├─ Checkout
    ├─ Configure AWS credentials (OIDC)
    ├─ Login to ECR
    ├─ docker build -f infra/deployment/docker/$dockerfile
    │    --build-arg APP_NAME=$app_name
    │    [--build-arg APP_TYPE=$app_type]      # skipped if null
    │    [--build-arg ENTRY_POINT=$entry_point] # skipped if null
    │    -t $ECR_REGISTRY/$image:$IMAGE_TAG
    ├─ docker push $ECR_REGISTRY/$image:$IMAGE_TAG
    └─ if deploy == true:
        ├─ aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region eu-north-1
        └─ helm upgrade --install $helm_release
             infra/deployment/kubernetes/helm/charts/$helm_chart
             -f infra/deployment/kubernetes/helm/values/cluster.yaml
             -f infra/deployment/kubernetes/helm/values/aws.yaml
             -f infra/deployment/kubernetes/helm/values/$helm_values
             --set imageRepository=$ECR_REGISTRY
             --set image.tag=$IMAGE_TAG
```

---

## Manual Trigger Workflow (`build-images-manual.yml`)

`workflow_dispatch` with a single `type: choice` input listing every image plus `all`:

```
choices:
  all
  registry-service-rest
  users-service-graphql
  users-service-grpc
  auth-service-graphql
  auth-service-grpc
  api-gateway-service-graphql
  api-gateway-service-rest
  admin
  web
```

- `all` → builds and deploys every image in `build-matrix.json` (flattened)
- specific image → builds and deploys that single entry
- No quality-checks or tests gate — goes straight to build+push+deploy
- Uses the same `_build-and-push.yml` reusable workflow

---

## GitHub Secrets Required

| Secret             | Existing? | Value                                    |
| ------------------ | --------- | ---------------------------------------- |
| `AWS_ACCOUNT_ID`   | Yes       | AWS account ID                           |
| `EKS_CLUSTER_NAME` | **New**   | EKS cluster name (e.g. `animemoria-dev`) |

---

## IAM Changes (Terraform)

### `ecr_push_policy.tf` — add EKS permission

Add `eks:DescribeCluster` to the existing `ECRPushPolicy` so the role can run `aws eks update-kubeconfig`.

### EKS access entry (new Terraform resource)

Add an EKS access entry granting the `github-actions-role-dev` IAM role access to the cluster with `AmazonEKSClusterAdminPolicy` (or a scoped role for Helm operations only):

```hcl
resource "aws_eks_access_entry" "github_actions" {
  cluster_name  = var.eks_cluster_name
  principal_arn = aws_iam_role.github_actions_ecr.arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "github_actions" {
  cluster_name  = var.eks_cluster_name
  principal_arn = aws_iam_role.github_actions_ecr.arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
  access_scope { type = "cluster" }
}
```

The IAM module gains a new input variable: `eks_cluster_name`.

---

## Error Handling

| Failure point        | Behaviour                                                        |
| -------------------- | ---------------------------------------------------------------- |
| Quality-checks fail  | `tests` and all build jobs skipped                               |
| Any test fails       | All build jobs skipped                                           |
| `docker push` fails  | Helm upgrade step never runs for that image                      |
| `helm upgrade` fails | Job fails, GitHub notifies; other parallel image jobs unaffected |
| Workflow cancelled   | All in-progress jobs stop immediately (GitHub native)            |
