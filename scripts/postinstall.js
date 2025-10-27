#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('=== Postinstall: Sharp setup ===');

// Check if sharp works already
try {
  const sharp = require('sharp');
  console.log('✓ sharp is already working');
  console.log('  sharp version:', sharp.versions.sharp);
  console.log('  libvips version:', sharp.versions.vips);
  console.log('');
  process.exit(0);
} catch (e) {
  console.log('Sharp needs to be installed/rebuilt...');
}

// Reinstall sharp with scripts enabled (npm install runs with ignore-scripts=true)
// This allows sharp to download and install the correct prebuilt binary
try {
  console.log('Reinstalling sharp with scripts enabled...');

  // Force reinstall sharp with scripts enabled and foreground output
  // This ensures the prebuilt binary is downloaded for the current platform
  execSync('npm install --ignore-scripts=false --foreground-scripts --force --platform=linux --arch=x64 sharp', {
    stdio: 'inherit',
    env: {
      ...process.env,
    }
  });

  // Clear require cache and test
  Object.keys(require.cache).forEach(key => {
    if (key.includes('sharp')) {
      delete require.cache[key];
    }
  });

  const sharp = require('sharp');
  console.log('\n✓ Successfully installed sharp');
  console.log('  sharp version:', sharp.versions.sharp);
  console.log('  libvips version:', sharp.versions.vips);
  console.log('');
} catch (e) {
  console.error('\n✗ Failed to reinstall sharp:', e.message);
  console.error('The build may fail. Check sharp installation.\n');
  // Don't exit with error - let the build try and fail with better error messages
}
