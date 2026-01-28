#!/bin/sh
# Generic script to create a non-root user for application runtime
# Can be used for both NestJS and Nginx/Vite applications
#
# Usage: setup-app-user.sh <username> <uid> <gid> [directories...]
#
# Examples:
#   setup-app-user.sh nestjs 1001 1001
#   setup-app-user.sh nginx-runner 1001 1001 /usr/share/nginx/html /var/cache/nginx

set -e

USER_NAME=${1:-app-user}
USER_ID=${2:-1001}
GROUP_ID=${3:-1001}

echo "👤 Setting up non-root user: ${USER_NAME} (${USER_ID}:${GROUP_ID})..."

# Create group
addgroup -g "$GROUP_ID" -S "$USER_NAME"

# Create user
adduser -S -D -H -u "$USER_ID" \
  -s /sbin/nologin \
  -G "$USER_NAME" \
  "$USER_NAME"

# Set ownership on provided directories
if [ $# -gt 3 ]; then
  echo "📁 Setting directory permissions..."
  shift 3  # Remove first 3 arguments (username, uid, gid)
  
  for dir in "$@"; do
    if [ -d "$dir" ]; then
      chown -R "${USER_NAME}:${USER_NAME}" "$dir"
      echo "  ✓ $dir"
    fi
  done
fi

echo "✅ User setup complete"
