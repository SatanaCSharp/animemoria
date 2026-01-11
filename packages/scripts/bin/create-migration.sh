#!/bin/bash

# Parse arguments to extract the migration name
MIGRATION_NAME=""
MIGRATION_PATH="db/migrations"

# Skip the first argument if it's "--"
if [ "$1" = "--" ]; then
  shift
fi

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --name=*)
      MIGRATION_NAME="${1#*=}"
      shift
      ;;
    --name)
      MIGRATION_NAME="$2"
      shift 2
      ;;
    --path=*)
      MIGRATION_PATH="${1#*=}"
      shift
      ;;
    --path)
      MIGRATION_PATH="$2"
      shift 2
      ;;
    *)
      # If no flag, assume it's the migration name
      if [ -z "$MIGRATION_NAME" ]; then
        MIGRATION_NAME="$1"
      fi
      shift
      ;;
  esac
done

# Check if name argument is provided
if [ -z "$MIGRATION_NAME" ]; then
  echo "Error: Migration name is required"
  echo ""
  echo "Usage:"
  echo "  pnpm migration:create --name=<MigrationName>"
  echo "  pnpm migration:create -- <MigrationName>"
  echo ""
  echo "Options:"
  echo "  --name <name>       Migration name (required)"
  echo "  --path <path>       Custom path for migrations (default: db/migrations)"
  exit 1
fi

# Create migration with the provided name
# Note: typeorm command should be available in PATH when running via pnpm scripts
typeorm migration:create "$MIGRATION_PATH/$MIGRATION_NAME"
