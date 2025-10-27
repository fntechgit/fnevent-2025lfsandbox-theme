#!/usr/bin/env node

console.log('=== Prebuild verification ===');

// Verify sharp is ready before the build starts
try {
  const sharp = require('sharp');
  console.log('✓ sharp is ready for build');
  console.log('  sharp version:', sharp.versions.sharp);
  console.log('  libvips version:', sharp.versions.vips);
  console.log('');
  process.exit(0);
} catch (e) {
  console.error('✗ ERROR: sharp is not working!');
  console.error('  Error:', e.message);
  console.error('\nSharp must be installed correctly before the build can proceed.');
  console.error('This should have been fixed during npm install.');
  console.error('\nIf you see this error on Heroku, ensure:');
  console.error('  1. The Aptfile contains: libvips-dev');
  console.error('  2. The heroku/nodejs buildpack is used');
  console.error('  3. The heroku-community/apt buildpack is added before nodejs');
  process.exit(1);
}
