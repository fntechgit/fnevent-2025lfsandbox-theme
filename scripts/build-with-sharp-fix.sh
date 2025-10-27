#!/bin/bash
set -e

echo "=== Pre-build: Fixing sharp module ==="

# Check if sharp already works
if node -e "require('sharp')" 2>/dev/null; then
  echo "✓ sharp is already working"
  node -e "const s = require('sharp'); console.log('  sharp version:', s.versions.sharp); console.log('  libvips version:', s.versions.vips);"
else
  echo "✗ sharp is not working, attempting to fix..."

  # Remove sharp completely first to ensure clean reinstall
  echo "Removing sharp module completely..."
  rm -rf node_modules/sharp node_modules/@img 2>/dev/null || true

  # Clear npm cache for sharp
  echo "Clearing npm cache for sharp..."
  npm cache clean --force 2>/dev/null || true

  # Reinstall sharp with scripts explicitly enabled, overriding .npmrc
  echo "Reinstalling sharp with native bindings..."
  npm install --ignore-scripts=false --foreground-scripts --verbose sharp || {
    echo "ERROR: Failed to reinstall sharp"
    exit 1
  }

  # Verify sharp now works
  if node -e "require('sharp')" 2>/dev/null; then
    echo "✓ Successfully fixed sharp!"
    node -e "const s = require('sharp'); console.log('  sharp version:', s.versions.sharp); console.log('  libvips version:', s.versions.vips);"
  else
    echo "ERROR: sharp still not working after fix attempts"
    node -e "require('sharp')" || true  # Show the actual error
    exit 1
  fi
fi

echo ""
echo "=== Starting Gatsby build ==="
NODE_ENV=production NODE_OPTIONS=--max-old-space-size=10240 node --trace-warnings node_modules/.bin/gatsby build --log-pages
