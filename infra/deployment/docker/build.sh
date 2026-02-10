#!/bin/bash
# Build script for AnimeMoria Dockerfiles
# This script builds the base image first, then the application images
#
# Usage:
#   ./build.sh <app-type> <app-name> [entry-point]
#
# Examples:
#   ./build.sh nestjs registry-service rest.main
#   ./build.sh nestjs auth-service graphql.main
#   ./build.sh vite admin

set -e

# ============================================================================
# Configuration: Excluded Packages by App Type
# ============================================================================
# Define which packages should be excluded for each application type
# These packages are removed during the build to reduce image size

# NestJS applications exclude frontend-specific packages
NESTJS_EXCLUDED_PACKAGES="eslint-config-base eslint-config-service eslint-config-ui graphql/generated ui-shared"

# Vite applications exclude backend-specific packages
VITE_EXCLUDED_PACKAGES="nest-shared scripts graphql/definitions grpc eslint-config-base eslint-config-service eslint-config-ui"

# ============================================================================
# Script Arguments
# ============================================================================
APP_TYPE=$1
APP_NAME=$2
ENTRY_POINT=$3

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ -z "$APP_TYPE" ] || [ -z "$APP_NAME" ]; then
    echo -e "${RED}❌ Error: Missing required arguments${NC}"
    echo ""
    echo "Usage: $0 <app-type> <app-name> [entry-point]"
    echo ""
    echo "Examples:"
    echo "  $0 nestjs registry-service rest.main"
    echo "  $0 nestjs auth-service graphql.main"
    echo "  $0 nestjs users-service grpc.main"
    echo "  $0 vite admin"
    echo ""
    exit 1
fi

# ============================================================================
# Configure build parameters based on app type
# ============================================================================
if [ "$APP_TYPE" == "nestjs" ]; then
    EXCLUDED_PACKAGES="$NESTJS_EXCLUDED_PACKAGES"
    CACHE_ID="pnpm-nestjs"
    DOCKERFILE="infra/deployment/docker/Dockerfile.nestjs"

    if [ -z "$ENTRY_POINT" ]; then
        echo -e "${RED}❌ Error: ENTRY_POINT required for NestJS apps${NC}"
        echo "Example: $0 nestjs auth-service graphql.main"
        exit 1
    fi
elif [ "$APP_TYPE" == "vite" ]; then
    EXCLUDED_PACKAGES="$VITE_EXCLUDED_PACKAGES"
    CACHE_ID="pnpm-vite"
    DOCKERFILE="infra/deployment/docker/Dockerfile.vite"
else
    echo -e "${RED}❌ Error: Unknown app type: $APP_TYPE${NC}"
    echo "Supported types: nestjs, vite"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Building AnimeMoria Docker Images${NC}"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "App Type:         $APP_TYPE"
echo "App Name:         $APP_NAME"
if [ -n "$ENTRY_POINT" ]; then
    echo "Entry Point:      $ENTRY_POINT"
fi
echo "Excluded Pkgs:    $EXCLUDED_PACKAGES"
echo "Cache ID:         $CACHE_ID"
echo ""

# Step 1: Build base image
echo -e "${YELLOW}📦 Step 1/2: Building base image with dependencies...${NC}"
echo ""

docker build \
    -f infra/deployment/docker/Dockerfile.base \
    --build-arg APP_NAME="$APP_NAME" \
    --build-arg EXCLUDED_PACKAGES="$EXCLUDED_PACKAGES" \
    --build-arg CACHE_ID="$CACHE_ID" \
    -t "animemoria/base:${APP_NAME}-deps" \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Base image build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Base image built: animemoria/base:${APP_NAME}-deps${NC}"
echo ""

# Verify excluded packages were removed
echo -e "${YELLOW}🔍 Verifying excluded packages...${NC}"
FIRST_EXCLUDED=$(echo $EXCLUDED_PACKAGES | awk '{print $1}')
if docker run --rm "animemoria/base:${APP_NAME}-deps" sh -c "test -d /app/packages/${FIRST_EXCLUDED}" 2>/dev/null; then
    echo -e "${RED}⚠️  Warning: Package '${FIRST_EXCLUDED}' still exists in base image${NC}"
    echo -e "${YELLOW}   Excluded packages might not be working correctly${NC}"
else
    echo -e "${GREEN}✅ Excluded packages verified (${FIRST_EXCLUDED} not found)${NC}"
fi
echo ""

# Step 2: Build application image
echo -e "${YELLOW}📦 Step 2/2: Building application image...${NC}"
echo ""

if [ "$APP_TYPE" == "nestjs" ]; then
    docker build \
        -f "$DOCKERFILE" \
        --build-arg APP_NAME="$APP_NAME" \
        --build-arg ENTRY_POINT="$ENTRY_POINT" \
        --build-arg EXCLUDED_PACKAGES="$EXCLUDED_PACKAGES" \
        -t "${APP_NAME}:latest" \
        .
elif [ "$APP_TYPE" == "vite" ]; then
    docker build \
        -f "$DOCKERFILE" \
        --build-arg APP_NAME="$APP_NAME" \
        --build-arg EXCLUDED_PACKAGES="$EXCLUDED_PACKAGES" \
        -t "${APP_NAME}:latest" \
        .
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Application image build failed${NC}"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ Build Complete!${NC}"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Images created:"
echo "  • animemoria/base:${APP_NAME}-deps (base with dependencies)"
echo "  • ${APP_NAME}:latest (application image)"
echo ""
echo "To run:"
if [ "$APP_TYPE" == "nestjs" ]; then
    echo "  docker run -d --name ${APP_NAME} -p 3000:3000 ${APP_NAME}:latest"
elif [ "$APP_TYPE" == "vite" ]; then
    echo "  docker run -d --name ${APP_NAME} -p 80:80 ${APP_NAME}:latest"
fi
echo ""
