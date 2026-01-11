#!/bin/bash

# Migration undo all script that uses Node.js --env-file flag
# Runs the undo-all-migrations script from @packages/nest-shared
# Supports both development (TypeScript) and production (JavaScript) modes

ENV_FILE=".env"
MODE="dev"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env-file=*)
      ENV_FILE="${1#*=}"
      shift
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --mode=*)
      MODE="${1#*=}"
      shift
      ;;
    --mode)
      MODE="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file '$ENV_FILE' not found"
  exit 1
fi

echo "⚠️  WARNING: This will undo ALL migrations!"
echo "Using env file: $ENV_FILE"

if [ "$MODE" = "prod" ]; then
  # Production mode: run compiled JavaScript from node_modules
  echo "Mode: Production (using compiled JS from @packages/nest-shared)"
  node --env-file="$ENV_FILE" ./node_modules/@packages/nest-shared/dist/orm/migration/undo-all-migrations.js
else
  # Development mode: run TypeScript directly from node_modules
  echo "Mode: Development (using TypeScript from @packages/nest-shared)"
  node --env-file="$ENV_FILE" \
    --require ts-node/register \
    --require tsconfig-paths/register \
    ./node_modules/@packages/nest-shared/src/orm/migration/undo-all-migrations.ts
fi

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "✓ All migrations reverted successfully"
else
  echo "✗ Migration revert failed with exit code $EXIT_CODE"
fi

exit $EXIT_CODE
