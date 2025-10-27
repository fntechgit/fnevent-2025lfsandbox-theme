#!/bin/bash
set -e

echo "=== Pre-build: Fixing sharp module ==="

# Check if sharp already works
if node -e "require('sharp')" 2>/dev/null; then
  echo "✓ sharp is already working"
  node -e "const s = require('sharp'); console.log('  sharp version:', s.versions.sharp); console.log('  libvips version:', s.versions.vips);"
else
  echo "✗ sharp is not working, attempting to fix..."

  # Try reinstalling sharp with scripts enabled and platform flags
  echo "Reinstalling sharp with scripts enabled..."
  npm install --ignore-scripts=false --foreground-scripts --platform=linux --arch=x64 sharp || {
    echo "First attempt failed, trying with --force..."
    npm install --ignore-scripts=false --foreground-scripts --force sharp || {
      echo "Second attempt failed, trying rebuild..."
      npm rebuild --ignore-scripts=false sharp || {
        echo "ERROR: All sharp fix attempts failed"
        exit 1
      }
    }
  }

  # Verify sharp now works
  if node -e "require('sharp')" 2>/dev/null; then
    echo "✓ Successfully fixed sharp!"
    node -e "const s = require('sharp'); console.log('  sharp version:', s.versions.sharp); console.log('  libvips version:', s.versions.vips);"
  else
    echo "ERROR: sharp still not working after fix attempts"
    exit 1
  fi
fi

echo ""
echo "=== Starting Gatsby build ==="
NODE_ENV=production NODE_OPTIONS=--max-old-space-size=10240 node --trace-warnings node_modules/.bin/gatsby build --log-pages
