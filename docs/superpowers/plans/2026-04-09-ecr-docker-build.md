# ECR Docker Build & Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On every merge to `master`, build changed Docker images, push to Amazon ECR, and upgrade the corresponding Helm releases in EKS; add a manual dispatch workflow for triggering individual image builds.

**Architecture:** The existing Turborepo change-detection matrix drives which workspaces changed. A new `expand-build-matrix` job cross-references a static `build-matrix.json` to expand workspace names into per-image build configs. A new reusable `_build-and-push.yml` workflow fans out one job per image: build → push → helm upgrade. A separate `build-images-manual.yml` workflow provides `workflow_dispatch` with an image selector.

**Tech Stack:** GitHub Actions, AWS ECR, AWS EKS, Helm v3, Terraform (AWS provider), Docker BuildKit, jq, aws-cli, aws-actions/configure-aws-credentials@v4, aws-actions/amazon-ecr-login@v2.

---

## Prerequisites

- AWS CLI configured locally with permissions to run `terraform plan/apply` against the dev account.
- `terraform` CLI installed.
- The EKS cluster already exists. Note its name — you will need it in Task 2.
- GitHub secret `AWS_ACCOUNT_ID` already set (existing). Add `EKS_CLUSTER_NAME` to GitHub repository secrets before the workflow runs.

---

## File Map

| Action | Path                                            |
| ------ | ----------------------------------------------- |
| Modify | `infra/aws-iac/modules/ecr/variables.tf`        |
| Modify | `infra/aws-iac/modules/iam/ecr_push_policy.tf`  |
| Modify | `infra/aws-iac/modules/iam/variables.tf`        |
| Create | `infra/aws-iac/modules/iam/eks_access.tf`       |
| Modify | `infra/aws-iac/environments/dev/main.tf`        |
| Create | `.github/build-matrix.json`                     |
| Modify | `.github/actions/build-and-push-ecr/action.yml` |
| Create | `.github/workflows/_build-and-push.yml`         |
| Modify | `.github/workflows/merge-pull-request.yml`      |
| Create | `.github/workflows/build-images-manual.yml`     |

---

## Task 1: Update ECR repositories in Terraform

Replace the two generic ECR repos with nine per-image repos.

**Files:**

- Modify: `infra/aws-iac/modules/ecr/variables.tf`

- [ ] **Step 1: Replace `repo_names` default list**

  Replace the entire contents of `infra/aws-iac/modules/ecr/variables.tf`:

  ```hcl
  variable "repo_names" {
    type        = list(string)
    description = "Names of the ECR repositories to create"

    default = [
      "registry-service-rest",
      "users-service-graphql",
      "users-service-grpc",
      "auth-service-graphql",
      "auth-service-grpc",
      "api-gateway-service-graphql",
      "api-gateway-service-rest",
      "admin",
      "web",
    ]
  }
  ```

- [ ] **Step 2: Validate and plan**

  ```bash
  cd infra/aws-iac/environments/dev
  terraform init
  terraform validate
  terraform plan
  ```

  Expected: plan shows **destroy 2** old repos (`animemoria-backend`, `animemoria-frontend`) and **create 9** new ones plus their lifecycle policies. Review the plan output before applying.

- [ ] **Step 3: Apply**

  ```bash
  terraform apply
  ```

  Type `yes` when prompted. Expected: `Apply complete! Resources: 18 added, 0 changed, 4 destroyed.` (9 repos × 2 resources each, minus 2 old repos × 2 resources).

- [ ] **Step 4: Commit**

  ```bash
  git add infra/aws-iac/modules/ecr/variables.tf
  git commit -m "ci(AM-45): update ECR repos to per-image naming"
  ```

---

## Task 2: Add EKS permissions to the GitHub Actions IAM role

The existing role only has ECR permissions. Add `eks:DescribeCluster` (needed for `aws eks update-kubeconfig`) and an EKS access entry (needed for Helm to talk to the cluster).

**Files:**

- Modify: `infra/aws-iac/modules/iam/ecr_push_policy.tf`
- Modify: `infra/aws-iac/modules/iam/variables.tf`
- Create: `infra/aws-iac/modules/iam/eks_access.tf`
- Modify: `infra/aws-iac/environments/dev/main.tf`

- [ ] **Step 1: Add `eks:DescribeCluster` to the ECR push policy**

  Replace the entire contents of `infra/aws-iac/modules/iam/ecr_push_policy.tf`:

  ```hcl
  resource "aws_iam_role_policy" "ecr_push" {
    name = "ECRPushPolicy"
    role = aws_iam_role.github_actions_ecr.id

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Effect = "Allow"
          Action = [
            "ecr:GetAuthorizationToken",
            "ecr:BatchCheckLayerAvailability",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload",
          ]
          Resource = "*"
        },
        {
          Effect   = "Allow"
          Action   = ["eks:DescribeCluster"]
          Resource = "*"
        },
      ]
    })
  }
  ```

- [ ] **Step 2: Add `eks_cluster_name` variable**

  Replace the entire contents of `infra/aws-iac/modules/iam/variables.tf`:

  ```hcl
  variable "env" {
    type        = string
    description = "The deployment environment (dev/prod)"

    validation {
      condition     = contains(["dev", "stage", "prod"], var.env)
      error_message = "The env variable must be dev, stage, or prod."
    }
  }

  variable "github_repo" {
    type        = string
    description = "The GitHub organization and repository name (e.g. org/repo)"

    default = "SatanaCSharp/animemoria"
  }

  variable "eks_cluster_name" {
    type        = string
    description = "Name of the EKS cluster to grant the GitHub Actions role access to"
  }
  ```

- [ ] **Step 3: Create EKS access entry resource**

  Create `infra/aws-iac/modules/iam/eks_access.tf`:

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

    access_scope {
      type = "cluster"
    }
  }
  ```

- [ ] **Step 4: Pass `eks_cluster_name` in the dev environment**

  Replace the entire contents of `infra/aws-iac/environments/dev/main.tf`:

  ```hcl
  provider "aws" {
    region = "eu-north-1"
  }

  module "gh_oidc" {
    source = "../../modules/iam"

    env              = "dev"
    eks_cluster_name = "animemoria-dev" # replace with your actual EKS cluster name
  }

  module "ecr_repos" {
    source = "../../modules/ecr"
  }
  ```

  Replace `"animemoria-dev"` with the actual EKS cluster name before applying.

- [ ] **Step 5: Validate and plan**

  ```bash
  cd infra/aws-iac/environments/dev
  terraform validate
  terraform plan
  ```

  Expected: plan shows update to `aws_iam_role_policy.ecr_push` (add EKS statement) and 2 new resources (`aws_eks_access_entry`, `aws_eks_access_policy_association`). **If the EKS cluster does not yet exist, this plan will error — skip the apply until the cluster is provisioned.**

- [ ] **Step 6: Apply**

  ```bash
  terraform apply
  ```

  Expected: `Apply complete! Resources: 2 added, 1 changed, 0 destroyed.`

- [ ] **Step 7: Commit**

  ```bash
  git add infra/aws-iac/modules/iam/ecr_push_policy.tf \
          infra/aws-iac/modules/iam/variables.tf \
          infra/aws-iac/modules/iam/eks_access.tf \
          infra/aws-iac/environments/dev/main.tf
  git commit -m "ci(AM-45): add EKS describe and access permissions to GitHub Actions IAM role"
  ```

---

## Task 3: Create `build-matrix.json`

Single source of truth mapping Turborepo workspace names to Docker build configs and Helm release metadata. Build args mirror the `docker:build:*` scripts in `package.json` exactly.

**Files:**

- Create: `.github/build-matrix.json`

- [ ] **Step 1: Create the file**

  Create `.github/build-matrix.json`:

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
        "app_type": "",
        "entry_point": "",
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
        "app_type": "",
        "entry_point": "",
        "helm_release": "",
        "helm_chart": "",
        "helm_values": "",
        "deploy": false
      }
    ]
  }
  ```

- [ ] **Step 2: Validate JSON**

  ```bash
  jq . .github/build-matrix.json
  ```

  Expected: pretty-printed JSON with no errors.

- [ ] **Step 3: Smoke-test the expand logic locally**

  Verify the jq filter that `expand-build-matrix` will use:

  ```bash
  CHANGED='["users-service","auth-service"]'
  BUILD_MATRIX=$(cat .github/build-matrix.json)
  echo "$CHANGED" | jq -c --argjson bm "$BUILD_MATRIX" '[.[] | $bm[.] // [] | .[]]'
  ```

  Expected output (4 objects in a flat array):

  ```json
  [{"image":"users-service-graphql",...},{"image":"users-service-grpc",...},{"image":"auth-service-graphql",...},{"image":"auth-service-grpc",...}]
  ```

- [ ] **Step 4: Smoke-test the "all" expand logic**

  ```bash
  jq -c '[.[] | .[]]' .github/build-matrix.json
  ```

  Expected: flat array of all 9 image configs.

- [ ] **Step 5: Smoke-test single-image filter**

  ```bash
  jq -c --arg img "api-gateway-service-rest" '[.[] | .[] | select(.image == $img)]' .github/build-matrix.json
  ```

  Expected: `[{"image":"api-gateway-service-rest",...}]`

- [ ] **Step 6: Commit**

  ```bash
  git add .github/build-matrix.json
  git commit -m "ci(AM-45): add Docker build matrix config"
  ```

---

## Task 4: Update `build-and-push-ecr` composite action

Replace the generic stub with a fully-parameterised action that builds with the correct args, pushes to ECR, and optionally runs `helm upgrade`.

**Files:**

- Modify: `.github/actions/build-and-push-ecr/action.yml`

- [ ] **Step 1: Replace the action**

  Replace the entire contents of `.github/actions/build-and-push-ecr/action.yml`:

  ```yaml
  name: Build and push Docker image to ECR
  description: >
    Build a Docker image using the monorepo Dockerfiles, push to Amazon ECR,
    and optionally upgrade the corresponding Helm release in EKS.

  inputs:
    aws-region:
      description: AWS region where ECR and EKS are located.
      required: false
      default: 'eu-north-1'
    ecr-repo:
      description: ECR repository name (e.g. users-service-graphql).
      required: true
    dockerfile:
      description: >
        Dockerfile filename under infra/deployment/docker/
        (e.g. Dockerfile.nestjs, Dockerfile.vite, Dockerfile.nextjs).
      required: true
    app-name:
      description: Value for the APP_NAME Docker build arg (e.g. users-service).
      required: true
    app-type:
      description: >
        Value for the APP_TYPE Docker build arg (e.g. graphql, grpc, rest).
        Leave empty for frontend images (admin, web).
      required: false
      default: ''
    entry-point:
      description: >
        Value for the ENTRY_POINT Docker build arg (e.g. graphql.main).
        Leave empty for frontend images.
      required: false
      default: ''
    image-tag:
      description: Docker image tag. Defaults to the commit SHA.
      required: false
      default: ${{ github.sha }}
    deploy:
      description: Set to 'true' to run helm upgrade after pushing the image.
      required: false
      default: 'false'
    helm-release:
      description: Helm release name (required when deploy is true).
      required: false
      default: ''
    helm-chart:
      description: >
        Helm chart directory name under infra/deployment/kubernetes/helm/charts/
        (e.g. microservice, frontend). Required when deploy is true.
      required: false
      default: ''
    helm-values:
      description: >
        Path to the service values file relative to
        infra/deployment/kubernetes/helm/values/
        (e.g. users-service/users-service-graphql.yaml). Required when deploy is true.
      required: false
      default: ''
    eks-cluster-name:
      description: EKS cluster name for aws eks update-kubeconfig. Required when deploy is true.
      required: false
      default: ''

  runs:
    using: composite
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-role-dev
          aws-region: ${{ inputs.aws-region }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        shell: bash
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${{ inputs.ecr-repo }}
          IMAGE_TAG: ${{ inputs.image-tag }}
          DOCKERFILE: ${{ inputs.dockerfile }}
          APP_NAME: ${{ inputs.app-name }}
          APP_TYPE: ${{ inputs.app-type }}
          ENTRY_POINT: ${{ inputs.entry-point }}
        run: |
          BUILD_ARGS="--build-arg APP_NAME=${APP_NAME}"
          if [ -n "${APP_TYPE}" ]; then
            BUILD_ARGS="${BUILD_ARGS} --build-arg APP_TYPE=${APP_TYPE}"
          fi
          if [ -n "${ENTRY_POINT}" ]; then
            BUILD_ARGS="${BUILD_ARGS} --build-arg ENTRY_POINT=${ENTRY_POINT}"
          fi

          docker build \
            -f "infra/deployment/docker/${DOCKERFILE}" \
            ${BUILD_ARGS} \
            -t "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}" \
            .

          docker push "${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

      - name: Update kubeconfig
        if: ${{ inputs.deploy == 'true' }}
        shell: bash
        env:
          AWS_REGION: ${{ inputs.aws-region }}
          EKS_CLUSTER_NAME: ${{ inputs.eks-cluster-name }}
        run: |
          aws eks update-kubeconfig \
            --name "${EKS_CLUSTER_NAME}" \
            --region "${AWS_REGION}"

      - name: Helm upgrade
        if: ${{ inputs.deploy == 'true' }}
        shell: bash
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ inputs.image-tag }}
          HELM_RELEASE: ${{ inputs.helm-release }}
          HELM_CHART: ${{ inputs.helm-chart }}
          HELM_VALUES: ${{ inputs.helm-values }}
        run: |
          helm upgrade --install "${HELM_RELEASE}" \
            "infra/deployment/kubernetes/helm/charts/${HELM_CHART}" \
            -f infra/deployment/kubernetes/helm/values/cluster.yaml \
            -f infra/deployment/kubernetes/helm/values/aws.yaml \
            -f "infra/deployment/kubernetes/helm/values/${HELM_VALUES}" \
            --set "imageRepository=${ECR_REGISTRY}" \
            --set "image.tag=${IMAGE_TAG}"
  ```

  > **Note:** The role name `github-actions-role-dev` matches `"github-actions-role-${var.env}"` in Terraform with `env = "dev"`.

- [ ] **Step 2: Validate YAML syntax**

  ```bash
  python3 -c "import yaml, sys; yaml.safe_load(open('.github/actions/build-and-push-ecr/action.yml'))" && echo "YAML OK"
  ```

  Expected: `YAML OK`

- [ ] **Step 3: Commit**

  ```bash
  git add .github/actions/build-and-push-ecr/action.yml
  git commit -m "ci(AM-45): update build-and-push-ecr action with build args and Helm upgrade"
  ```

---

## Task 5: Create `_build-and-push.yml` reusable workflow

Fan-out workflow that receives a JSON build matrix and runs one job per image.

**Files:**

- Create: `.github/workflows/_build-and-push.yml`

- [ ] **Step 1: Create the workflow**

  Create `.github/workflows/_build-and-push.yml`:

  ```yaml
  name: Reusable — Build, Push, and Deploy Images

  on:
    workflow_call:
      inputs:
        build-matrix:
          description: JSON array of image build configs from build-matrix.json.
          type: string
          required: true
        aws-region:
          description: AWS region for ECR and EKS.
          type: string
          required: false
          default: 'eu-north-1'
      secrets:
        AWS_ACCOUNT_ID:
          required: true
        EKS_CLUSTER_NAME:
          required: true

  permissions:
    id-token: write
    contents: read

  jobs:
    build-and-push:
      name: 'Build: ${{ matrix.image }}'
      runs-on: ubuntu-latest
      strategy:
        fail-fast: false
        matrix:
          include: ${{ fromJson(inputs.build-matrix) }}
      steps:
        - name: Checkout repository
          uses: actions/checkout@v4

        - name: Build, push, and deploy
          uses: ./.github/actions/build-and-push-ecr
          with:
            aws-region: ${{ inputs.aws-region }}
            ecr-repo: ${{ matrix.image }}
            dockerfile: ${{ matrix.dockerfile }}
            app-name: ${{ matrix.app_name }}
            app-type: ${{ matrix.app_type }}
            entry-point: ${{ matrix.entry_point }}
            image-tag: ${{ github.sha }}
            deploy: ${{ matrix.deploy }}
            helm-release: ${{ matrix.helm_release }}
            helm-chart: ${{ matrix.helm_chart }}
            helm-values: ${{ matrix.helm_values }}
            eks-cluster-name: ${{ secrets.EKS_CLUSTER_NAME }}
  ```

- [ ] **Step 2: Validate YAML syntax**

  ```bash
  python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/_build-and-push.yml'))" && echo "YAML OK"
  ```

  Expected: `YAML OK`

- [ ] **Step 3: Commit**

  ```bash
  git add .github/workflows/_build-and-push.yml
  git commit -m "ci(AM-45): add reusable build-and-push workflow"
  ```

---

## Task 6: Add build jobs to `merge-pull-request.yml`

Add `expand-build-matrix` (inline script job) and `build-and-push` (calls the reusable workflow) to the existing merge workflow. The build jobs only run when tests succeed.

**Files:**

- Modify: `.github/workflows/merge-pull-request.yml`

- [ ] **Step 1: Replace the workflow**

  Replace the entire contents of `.github/workflows/merge-pull-request.yml`:

  ```yaml
  name: CI — Merge

  on:
    push:
      branches:
        - master
    workflow_dispatch:

  permissions:
    contents: read

  concurrency:
    group: merge-master
    cancel-in-progress: false

  jobs:
    detect-changes:
      uses: ./.github/workflows/_detect-changes.yml
      with:
        base-sha: ${{ github.event.before }}

    quality-checks:
      needs: detect-changes
      if: needs.detect-changes.outputs.has_changes == 'true'
      uses: ./.github/workflows/_quality-checks.yml
      with:
        matrix: ${{ needs.detect-changes.outputs.matrix }}
        base-ref: master

    tests:
      needs: [detect-changes, quality-checks]
      if: |
        needs.detect-changes.outputs.has_changes == 'true' &&
        (needs.quality-checks.result == 'success' || needs.quality-checks.result == 'skipped')
      uses: ./.github/workflows/_tests.yml
      with:
        matrix: ${{ needs.detect-changes.outputs.matrix }}

    expand-build-matrix:
      name: Expand build matrix
      needs: [detect-changes, quality-checks, tests]
      if: |
        needs.detect-changes.outputs.has_changes == 'true' &&
        needs.tests.result == 'success'
      runs-on: ubuntu-latest
      outputs:
        build_matrix: ${{ steps.filter.outputs.build_matrix }}
        has_builds: ${{ steps.filter.outputs.has_builds }}
      steps:
        - name: Checkout repository
          uses: actions/checkout@v4

        - name: Filter build matrix
          id: filter
          env:
            CHANGED_WORKSPACES: ${{ needs.detect-changes.outputs.matrix }}
          run: |
            BUILD_MATRIX=$(cat .github/build-matrix.json)
            RESULT=$(echo "$CHANGED_WORKSPACES" | \
              jq -c --argjson bm "$BUILD_MATRIX" '[.[] | $bm[.] // [] | .[]]')

            if [ "$(echo "$RESULT" | jq 'length')" -eq 0 ]; then
              echo "has_builds=false" >> "$GITHUB_OUTPUT"
            else
              echo "has_builds=true" >> "$GITHUB_OUTPUT"
            fi
            echo "build_matrix=$RESULT" >> "$GITHUB_OUTPUT"

    build-and-push:
      needs: [expand-build-matrix]
      if: needs.expand-build-matrix.outputs.has_builds == 'true'
      uses: ./.github/workflows/_build-and-push.yml
      with:
        build-matrix: ${{ needs.expand-build-matrix.outputs.build_matrix }}
      secrets: inherit
  ```

- [ ] **Step 2: Validate YAML syntax**

  ```bash
  python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/merge-pull-request.yml'))" && echo "YAML OK"
  ```

  Expected: `YAML OK`

- [ ] **Step 3: Dry-run the expand logic against the actual repo**

  Simulate what `expand-build-matrix` will do when `users-service` and `@packages/nest-shared` both changed (Turbo would output `["users-service","auth-service","api-gateway-service"]`):

  ```bash
  CHANGED='["users-service","auth-service","api-gateway-service"]'
  BUILD_MATRIX=$(cat .github/build-matrix.json)
  echo "$CHANGED" | jq -c --argjson bm "$BUILD_MATRIX" '[.[] | $bm[.] // [] | .[]]' | jq 'length'
  ```

  Expected: `6` (2 users + 2 auth + 2 api-gateway)

- [ ] **Step 4: Commit**

  ```bash
  git add .github/workflows/merge-pull-request.yml
  git commit -m "ci(AM-45): add expand-build-matrix and build-and-push jobs to merge workflow"
  ```

---

## Task 7: Create `build-images-manual.yml`

Manual dispatch workflow for triggering any individual image build (or all) without the quality/test gate.

**Files:**

- Create: `.github/workflows/build-images-manual.yml`

- [ ] **Step 1: Create the workflow**

  Create `.github/workflows/build-images-manual.yml`:

  ```yaml
  name: Build Images — Manual

  on:
    workflow_dispatch:
      inputs:
        image:
          description: Image to build and deploy (choose 'all' to build every image)
          required: true
          type: choice
          options:
            - all
            - registry-service-rest
            - users-service-graphql
            - users-service-grpc
            - auth-service-graphql
            - auth-service-grpc
            - api-gateway-service-graphql
            - api-gateway-service-rest
            - admin
            - web

  permissions:
    contents: read

  concurrency:
    group: build-manual-${{ github.run_id }}
    cancel-in-progress: true

  jobs:
    prepare-matrix:
      name: Prepare build matrix
      runs-on: ubuntu-latest
      outputs:
        build_matrix: ${{ steps.filter.outputs.build_matrix }}
        has_builds: ${{ steps.filter.outputs.has_builds }}
      steps:
        - name: Checkout repository
          uses: actions/checkout@v4

        - name: Filter build matrix
          id: filter
          env:
            SELECTED_IMAGE: ${{ inputs.image }}
          run: |
            BUILD_MATRIX=$(cat .github/build-matrix.json)
            ALL_IMAGES=$(echo "$BUILD_MATRIX" | jq -c '[.[] | .[]]')

            if [ "$SELECTED_IMAGE" = "all" ]; then
              RESULT="$ALL_IMAGES"
            else
              RESULT=$(echo "$ALL_IMAGES" | \
                jq -c --arg img "$SELECTED_IMAGE" '[.[] | select(.image == $img)]')
            fi

            if [ "$(echo "$RESULT" | jq 'length')" -eq 0 ]; then
              echo "has_builds=false" >> "$GITHUB_OUTPUT"
            else
              echo "has_builds=true" >> "$GITHUB_OUTPUT"
            fi
            echo "build_matrix=$RESULT" >> "$GITHUB_OUTPUT"

    build-and-push:
      needs: prepare-matrix
      if: needs.prepare-matrix.outputs.has_builds == 'true'
      uses: ./.github/workflows/_build-and-push.yml
      with:
        build-matrix: ${{ needs.prepare-matrix.outputs.build_matrix }}
      secrets: inherit
  ```

- [ ] **Step 2: Validate YAML syntax**

  ```bash
  python3 -c "import yaml, sys; yaml.safe_load(open('.github/workflows/build-images-manual.yml'))" && echo "YAML OK"
  ```

  Expected: `YAML OK`

- [ ] **Step 3: Dry-run the filter logic for a specific image**

  ```bash
  SELECTED_IMAGE="auth-service-grpc"
  BUILD_MATRIX=$(cat .github/build-matrix.json)
  ALL_IMAGES=$(echo "$BUILD_MATRIX" | jq -c '[.[] | .[]]')
  echo "$ALL_IMAGES" | jq -c --arg img "$SELECTED_IMAGE" '[.[] | select(.image == $img)]'
  ```

  Expected: `[{"image":"auth-service-grpc","dockerfile":"Dockerfile.nestjs","app_name":"auth-service","app_type":"grpc","entry_point":"grpc.main","helm_release":"auth-service-grpc","helm_chart":"microservice","helm_values":"auth-service/auth-service-grpc.yaml","deploy":true}]`

- [ ] **Step 4: Dry-run the filter for "all"**

  ```bash
  BUILD_MATRIX=$(cat .github/build-matrix.json)
  echo "$BUILD_MATRIX" | jq -c '[.[] | .[]]' | jq 'map(.image)'
  ```

  Expected:

  ```json
  [
    "registry-service-rest",
    "users-service-graphql",
    "users-service-grpc",
    "auth-service-graphql",
    "auth-service-grpc",
    "api-gateway-service-graphql",
    "api-gateway-service-rest",
    "admin",
    "web"
  ]
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add .github/workflows/build-images-manual.yml
  git commit -m "ci(AM-45): add manual image build and deploy workflow"
  ```

---

## Task 8: Add `EKS_CLUSTER_NAME` GitHub secret

Before any workflow run, the secret must exist in the repository.

- [ ] **Step 1: Add the secret**

  Go to **GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret**.
  - Name: `EKS_CLUSTER_NAME`
  - Value: your EKS cluster name (the same value used in `main.tf` — e.g. `animemoria-dev`)

  Click **Add secret**.

---

## Task 9: Integration test via `workflow_dispatch`

Verify the full pipeline end-to-end using the manual workflow before relying on the automated merge trigger.

- [ ] **Step 1: Push the branch**

  ```bash
  git push origin feat/AM-45-master-merged-workflow
  ```

- [ ] **Step 2: Trigger the manual workflow**

  Go to **GitHub → Actions → "Build Images — Manual" → Run workflow**.
  Select branch `feat/AM-45-master-merged-workflow`.
  Select image: `registry-service-rest`.
  Click **Run workflow**.

- [ ] **Step 3: Verify the prepare-matrix job**

  In the workflow run, open the `prepare-matrix` job logs. Confirm:
  - `Filter build matrix` step outputs `build_matrix=[{"image":"registry-service-rest",...}]`
  - `has_builds=true`

- [ ] **Step 4: Verify the build-and-push job**

  Open the `Build: registry-service-rest` job logs. Confirm:
  - `Configure AWS credentials` succeeds (OIDC role assumed)
  - `Login to Amazon ECR` succeeds
  - `Build and push Docker image` step runs `docker build -f infra/deployment/docker/Dockerfile.nestjs --build-arg APP_NAME=registry-service --build-arg APP_TYPE=rest --build-arg ENTRY_POINT=rest.main` and succeeds
  - `docker push` succeeds
  - `Update kubeconfig` and `Helm upgrade` steps run (deploy=true)

- [ ] **Step 5: Verify the ECR image exists**

  ```bash
  aws ecr describe-images \
    --repository-name registry-service-rest \
    --region eu-north-1 \
    --query 'imageDetails[*].imageTags'
  ```

  Expected: the commit SHA tag appears in the output.

- [ ] **Step 6: Verify the Helm release was upgraded**

  ```bash
  aws eks update-kubeconfig --name animemoria-dev --region eu-north-1
  helm status registry-service-rest
  ```

  Expected: `STATUS: deployed` with the updated image tag.

---

## Self-Review Notes

**Spec coverage check:**

- ✅ Builds only on merge to master — `merge-pull-request.yml` trigger
- ✅ Only changed services — `expand-build-matrix` job filters by turbo changed matrix
- ✅ Package changes trigger related service builds — Turbo `...[base-ref]` filter handles this in existing change-detection
- ✅ ECR repos per image — Task 1
- ✅ Build args match `package.json` scripts — Task 4 composite action
- ✅ Tests must pass before build — `expand-build-matrix` condition `needs.tests.result == 'success'`
- ✅ Cancellation stops everything — `needs` chain + GitHub native cancellation
- ✅ Helm upgrade after push — Task 4 composite action steps
- ✅ Manual trigger per image — Task 7
- ✅ `EKS_CLUSTER_NAME` GitHub secret — Task 8
- ✅ IAM permissions for EKS — Task 2

**`web` note:** `web` has `"deploy": false` — the kubeconfig and Helm upgrade steps are skipped. Only ECR build and push runs. This is intentional — `web` has no Helm release in the current deployment setup.
