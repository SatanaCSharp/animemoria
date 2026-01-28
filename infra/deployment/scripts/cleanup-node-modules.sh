#!/bin/sh
# Cleanup script for node_modules directory
# Removes test files, source maps, and unnecessary documentation to reduce image size
#
# Usage: cleanup-node-modules.sh <node_modules_path>
#
# This can save 20-40MB but keeps all runtime code intact

set -e

TARGET_DIR=${1:-./node_modules}

if [ ! -d "$TARGET_DIR" ]; then
  echo "⚠️  Directory not found: $TARGET_DIR"
  exit 0
fi

echo "🧹 Cleaning up node_modules: $TARGET_DIR"

# Count initial size
INITIAL_SIZE=$(du -sh "$TARGET_DIR" 2>/dev/null | cut -f1 || echo "unknown")
echo "  Initial size: $INITIAL_SIZE"

# Remove source maps
echo "  - Removing source maps (*.map)"
find "$TARGET_DIR" -type f -name "*.map" -delete 2>/dev/null || true

# Remove test files
echo "  - Removing test files"
find "$TARGET_DIR" -type f -name "*.test.js" -delete 2>/dev/null || true
find "$TARGET_DIR" -type f -name "*.spec.js" -delete 2>/dev/null || true

# Remove test directories
echo "  - Removing test directories"
find "$TARGET_DIR" -type d -name "test" -prune -exec rm -rf {} + 2>/dev/null || true
find "$TARGET_DIR" -type d -name "tests" -prune -exec rm -rf {} + 2>/dev/null || true
find "$TARGET_DIR" -type d -name "__tests__" -prune -exec rm -rf {} + 2>/dev/null || true

# Remove documentation (except README.md)
echo "  - Removing documentation"
find "$TARGET_DIR" -type f -name "*.md" ! -name "README.md" -delete 2>/dev/null || true
find "$TARGET_DIR" -type f -name "CHANGELOG*" -delete 2>/dev/null || true
find "$TARGET_DIR" -type f -name "LICENSE*" -delete 2>/dev/null || true

# Remove .github directories
echo "  - Removing .github directories"
find "$TARGET_DIR" -type d -name ".github" -prune -exec rm -rf {} + 2>/dev/null || true

# Count final size
FINAL_SIZE=$(du -sh "$TARGET_DIR" 2>/dev/null | cut -f1 || echo "unknown")
echo "  Final size: $FINAL_SIZE"

echo "✅ Cleanup complete"
