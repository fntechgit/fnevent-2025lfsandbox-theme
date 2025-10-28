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
echo "=== Pre-build: Fixing Sentry CLI ==="

# Check if sentry-cli binaries exist in common locations
SENTRY_CLI_PATHS=(
  "node_modules/@sentry/cli/sentry-cli"
  "node_modules/@sentry/webpack-plugin/node_modules/@sentry/cli/sentry-cli"
)

SENTRY_CLI_FOUND=false
for CLI_PATH in "${SENTRY_CLI_PATHS[@]}"; do
  if [ -f "$CLI_PATH" ] && [ -x "$CLI_PATH" ]; then
    echo "✓ Sentry CLI found at $CLI_PATH"
    $CLI_PATH --version 2>/dev/null || echo "  (binary exists but version check failed)"
    SENTRY_CLI_FOUND=true
  fi
done

if [ "$SENTRY_CLI_FOUND" = false ]; then
  echo "✗ Sentry CLI binary not found, attempting to install..."

  # Remove @sentry/cli modules to ensure clean reinstall
  echo "Removing @sentry/cli modules..."
  rm -rf node_modules/@sentry/cli 2>/dev/null || true
  rm -rf node_modules/@sentry/webpack-plugin/node_modules/@sentry/cli 2>/dev/null || true

  # Reinstall @sentry packages with scripts explicitly enabled, overriding .npmrc
  echo "Reinstalling Sentry packages with binary download..."

  # First try to reinstall the webpack plugin (which should pull in @sentry/cli)
  npm install --ignore-scripts=false --foreground-scripts @sentry/webpack-plugin @sentry/cli || {
    echo "WARNING: Failed to install Sentry CLI"
    echo "  Build will continue but Sentry source maps may not be uploaded"
  }

  # Verify sentry-cli now exists in any of the expected locations
  SENTRY_CLI_FOUND=false
  for CLI_PATH in "${SENTRY_CLI_PATHS[@]}"; do
    if [ -f "$CLI_PATH" ] && [ -x "$CLI_PATH" ]; then
      echo "✓ Successfully installed Sentry CLI at $CLI_PATH!"
      $CLI_PATH --version 2>/dev/null || true
      SENTRY_CLI_FOUND=true
      break
    fi
  done

  if [ "$SENTRY_CLI_FOUND" = false ]; then
    echo "WARNING: Sentry CLI still not available in any expected location"
    echo "  Build will continue but Sentry integration may be limited"
  fi
fi

echo ""
echo "=== Starting Gatsby build ==="
NODE_ENV=production NODE_OPTIONS=--max-old-space-size=10240 node --trace-warnings node_modules/.bin/gatsby build --log-pages
