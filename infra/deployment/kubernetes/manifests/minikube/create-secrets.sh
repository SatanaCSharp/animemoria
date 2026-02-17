#!/usr/bin/env bash
# Creates Kubernetes secrets from apps/*-service/.env files for minikube deployment.
#
# Usage:
#   ./create-secrets.sh [namespace]
#
# Reads .env files directly from the monorepo apps/ directory:
#   apps/auth-service/.env            -> auth-graphql-service-config, auth-grpc-service-config
#   apps/users-service/.env           -> users-graphql-service-config, users-grpc-service-config
#   apps/api-gateway-service/.env     -> api-gateway-graphql-service-config, api-gateway-rest-service-config
#   apps/registry-service/.env        -> registry-service-config
#
# The .env files may contain connectivity vars (URLs, ports) alongside secrets — that's fine.
# Helm container env overrides connectivity vars at runtime, so only the secrets matter in K8s.
# The same .env file is used for all releases of a given service since they share the same config.

set -euo pipefail

NAMESPACE="${1:-default}"

# Resolve monorepo root (script lives in infra/deployment/kubernetes/manifests/minikube/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"
APPS_DIR="$REPO_ROOT/apps"

if [ ! -d "$APPS_DIR" ]; then
  echo "Error: apps directory not found at '$APPS_DIR'" >&2
  exit 1
fi

# service directory -> K8s secret names
declare -A SERVICE_SECRETS=(
  ["auth-service"]="auth-graphql-service-config auth-grpc-service-config"
  ["users-service"]="users-graphql-service-config users-grpc-service-config"
  ["api-gateway-service"]="api-gateway-graphql-service-config api-gateway-rest-service-config"
  ["registry-service"]="registry-service-config"
)

created=0

for service in "${!SERVICE_SECRETS[@]}"; do
  env_path="$APPS_DIR/$service/.env"

  if [ ! -f "$env_path" ]; then
    echo "Skipping $service (no .env found at $env_path)"
    continue
  fi

  for secret_name in ${SERVICE_SECRETS[$service]}; do
    echo "Creating secret '$secret_name' from apps/$service/.env in namespace '$NAMESPACE'..."
    kubectl create secret generic "$secret_name" \
      --from-env-file="$env_path" \
      --namespace="$NAMESPACE" \
      --dry-run=client -o yaml | kubectl apply -f -
    ((created++))
  done
done

echo "Done. Created/updated $created secret(s) in namespace '$NAMESPACE'."
