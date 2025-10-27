#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running postinstall script to fix sharp...');

// Check if sharp works
try {
  require('sharp');
  console.log('sharp is already working, no fix needed.');
  process.exit(0);
} catch (e) {
  console.log('sharp needs to be fixed, attempting installation...');
}

// Clean environment for sharp installation
const cleanEnv = {
  ...process.env,
  npm_config_sharp_ignore_global_libvips: '1',
  SHARP_IGNORE_GLOBAL_LIBVIPS: '1',
  HTTP_PROXY: '',
  HTTPS_PROXY: '',
  http_proxy: '',
  https_proxy: '',
  NO_PROXY: '*',
  no_proxy: '*'
};

// Try to install/rebuild sharp with various methods
const methods = [
  // Method 1: Force reinstall sharp with prebuilt binaries
  () => {
    console.log('Method 1: Force reinstalling sharp with prebuilt binaries...');
    execSync('npm install --force --ignore-scripts=false --platform=linux --arch=x64 sharp@0.32.6', {
      env: cleanEnv,
      stdio: 'inherit'
    });
  },
  // Method 2: Rebuild sharp without proxy
  () => {
    console.log('Method 2: Rebuilding sharp...');
    execSync('npm rebuild sharp --ignore-scripts=false', {
      env: cleanEnv,
      stdio: 'inherit'
    });
  },
  // Method 3: Install sharp with npm install
  () => {
    console.log('Method 3: Installing sharp directly...');
    execSync('npm install --ignore-scripts=false sharp@0.32.6', {
      env: cleanEnv,
      stdio: 'inherit'
    });
  },
  // Method 4: Try with proxy settings intact
  () => {
    console.log('Method 4: Rebuilding with system proxy...');
    execSync('npm rebuild sharp --ignore-scripts=false', {
      env: {
        ...process.env,
        npm_config_sharp_ignore_global_libvips: '1',
        SHARP_IGNORE_GLOBAL_LIBVIPS: '1'
      },
      stdio: 'inherit'
    });
  }
];

for (let i = 0; i < methods.length; i++) {
  try {
    methods[i]();
    // Clear require cache and check if it worked
    Object.keys(require.cache).forEach(key => {
      if (key.includes('sharp')) {
        delete require.cache[key];
      }
    });
    require('sharp');
    console.log(`Successfully fixed sharp using method ${i + 1}!`);
    process.exit(0);
  } catch (e) {
    console.log(`Method ${i + 1} failed: ${e.message}`);
    if (i < methods.length - 1) {
      console.log(`Trying next method...`);
    }
  }
}

console.log('Warning: Could not fix sharp automatically during postinstall.');
console.log('This may work at build time if network configuration is different.');
process.exit(0); // Don't fail the install
