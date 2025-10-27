#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('=== Sharp postinstall check ===');

// Check if we're using global libvips (Heroku with apt buildpack)
const useGlobalLibvips = process.env.SHARP_FORCE_GLOBAL_LIBVIPS === 'true';

// Check if sharp works
try {
  const sharp = require('sharp');
  console.log('✓ sharp is working correctly');
  if (useGlobalLibvips) {
    console.log('  Using system libvips');
  }
  process.exit(0);
} catch (e) {
  console.log('✗ sharp is not working yet');
  console.log('  This is normal - sharp will be fixed by the prebuild script if needed');
  console.log('  Error:', e.message);
}

// Don't fail the install - let prebuild handle it
console.log('Postinstall complete');
process.exit(0);
