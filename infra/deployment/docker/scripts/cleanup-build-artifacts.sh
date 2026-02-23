#!/bin/sh
set -e

TARGET_DIR=${1:-.}

echo "🧹 Cleaning up build artifacts in $TARGET_DIR..."

# Remove source maps
echo "  - Removing source maps (*.map)"
find "$TARGET_DIR" -type f -name "*.map" -delete 2>/dev/null || true

# Remove test files
echo "  - Removing test files"
find "$TARGET_DIR" -type f \( \
    -name "*.test.js" -o -name "*.test.d.ts" -o \
    -name "*.spec.js" -o -name "*.spec.d.ts" \
\) -delete 2>/dev/null || true

# Remove test directories
echo "  - Removing test directories"
find "$TARGET_DIR" -type d \( \
    -name "__tests__" -o -name "test" -o -name "tests" \
\) -exec rm -rf {} + 2>/dev/null || true

echo "✅ Cleanup complete"
