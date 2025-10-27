#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Sharp prebuild check ===');

// Check if we're using global libvips (Heroku with apt buildpack)
const useGlobalLibvips = process.env.SHARP_FORCE_GLOBAL_LIBVIPS === 'true';
console.log(`Using ${useGlobalLibvips ? 'system' : 'bundled'} libvips`);

// Try to require sharp
try {
  const sharp = require('sharp');
  console.log('✓ sharp is working correctly');
  console.log('  Version:', sharp.versions);
  process.exit(0);
} catch (e) {
  console.error('✗ sharp is not working:', e.message);
  console.log('Attempting to fix sharp before build...');
}

// Check what's actually in the sharp module
const sharpPath = path.join(__dirname, '../node_modules/sharp');
if (fs.existsSync(sharpPath)) {
  console.log('\nSharp module exists at:', sharpPath);
  const buildPath = path.join(sharpPath, 'build/Release');
  if (fs.existsSync(buildPath)) {
    console.log('Build directory exists:', fs.readdirSync(buildPath));
  } else {
    console.log('Build directory missing - sharp needs to be rebuilt');
  }
} else {
  console.error('Sharp module not found!');
}

// Prepare environment
const env = {
  ...process.env,
};

// If using global libvips, ensure it's detected
if (useGlobalLibvips) {
  console.log('\nConfiguring for system libvips...');
  delete env.npm_config_sharp_ignore_global_libvips;
  delete env.SHARP_IGNORE_GLOBAL_LIBVIPS;
}

// Try to rebuild/reinstall sharp
const methods = [
  () => {
    console.log('\nMethod 1: Rebuilding sharp with clean proxy environment...');
    const cleanEnv = {
      ...env,
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      http_proxy: '',
      https_proxy: '',
      NO_PROXY: '*',
      no_proxy: '*'
    };
    execSync('npm rebuild --ignore-scripts=false sharp', {
      env: cleanEnv,
      stdio: 'inherit'
    });
  },
  () => {
    console.log('\nMethod 2: Rebuilding sharp with default environment...');
    execSync('npm rebuild --ignore-scripts=false sharp', {
      env,
      stdio: 'inherit'
    });
  },
  () => {
    console.log('\nMethod 3: Reinstalling sharp with platform flags...');
    execSync('npm install --ignore-scripts=false --platform=linux --arch=x64 sharp', {
      env,
      stdio: 'inherit'
    });
  },
  () => {
    console.log('\nMethod 4: Force reinstalling sharp...');
    execSync('npm install --ignore-scripts=false --force sharp', {
      env,
      stdio: 'inherit'
    });
  }
];

for (let i = 0; i < methods.length; i++) {
  try {
    methods[i]();

    // Clear require cache
    Object.keys(require.cache).forEach(key => {
      if (key.includes('sharp')) {
        delete require.cache[key];
      }
    });

    // Test if it works now
    const sharp = require('sharp');
    console.log(`\n✓ Successfully fixed sharp using method ${i + 1}!`);
    console.log('  Version:', sharp.versions);
    process.exit(0);
  } catch (e) {
    console.error(`Method ${i + 1} failed:`, e.message);
  }
}

console.error('\nERROR: Could not fix sharp. Build will likely fail.');
console.error('Please check:');
console.error('  1. Network connectivity');
console.error('  2. System libvips installation (if using SHARP_FORCE_GLOBAL_LIBVIPS)');
console.error('  3. npm configuration');
process.exit(1);
