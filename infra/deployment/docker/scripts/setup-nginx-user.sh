#!/bin/sh
set -e

USER_NAME=${1:-nginx-runner}
USER_ID=${2:-1001}
GROUP_ID=${3:-1001}

echo "👤 Setting up non-root nginx user..."

# Create group
addgroup -g "$GROUP_ID" -S "$USER_NAME"

# Create user
adduser -S -D -H \
    -u "$USER_ID" \
    -h /var/cache/nginx \
    -s /sbin/nologin \
    -G "$USER_NAME" \
    -g "$USER_NAME" \
    "$USER_NAME"

# Set ownership for nginx directories
echo "📁 Setting directory permissions..."
chown -R "$USER_NAME:$USER_NAME" /usr/share/nginx/html
chown -R "$USER_NAME:$USER_NAME" /var/cache/nginx
chown -R "$USER_NAME:$USER_NAME" /var/log/nginx

# Create and set ownership for pid file
touch /var/run/nginx.pid
chown -R "$USER_NAME:$USER_NAME" /var/run/nginx.pid

echo "✅ Nginx user setup complete"
