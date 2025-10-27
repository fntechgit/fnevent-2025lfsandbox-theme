#!/usr/bin/env node

console.log('=== Postinstall check ===');

// Just check if sharp is working - don't try to fix it here
// The prebuild script will handle fixing sharp before the build
try {
  const sharp = require('sharp');
  console.log('✓ sharp is working');
  console.log('  sharp version:', sharp.versions.sharp);
  console.log('  libvips version:', sharp.versions.vips);
} catch (e) {
  console.log('⚠ sharp is not yet working (this is expected with ignore-scripts=true)');
  console.log('  It will be fixed by the prebuild script before the build runs.');
}

console.log('');
