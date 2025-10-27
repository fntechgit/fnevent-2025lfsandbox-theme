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
  console.log('sharp needs to be fixed, attempting rebuild...');
}

// Try to rebuild sharp with various methods
const methods = [
  // Method 1: Try without proxy
  () => {
    console.log('Method 1: Rebuilding without proxy...');
    execSync('npm rebuild sharp --ignore-scripts=false', {
      env: {
        ...process.env,
        HTTP_PROXY: '',
        HTTPS_PROXY: '',
        http_proxy: '',
        https_proxy: '',
        NO_PROXY: '*',
        no_proxy: '*'
      },
      stdio: 'inherit'
    });
  },
  // Method 2: Try with proxy
  () => {
    console.log('Method 2: Rebuilding with proxy...');
    execSync('npm rebuild sharp --ignore-scripts=false', {
      stdio: 'inherit'
    });
  },
  // Method 3: Try installing sharp directly
  () => {
    console.log('Method 3: Installing sharp with platform flags...');
    execSync('npm install --platform=linux --arch=x64 --ignore-scripts=false sharp', {
      stdio: 'inherit'
    });
  }
];

for (const method of methods) {
  try {
    method();
    // Check if it worked
    require.cache = {}; // Clear require cache
    require('sharp');
    console.log('Successfully fixed sharp!');
    process.exit(0);
  } catch (e) {
    console.log(`Method failed: ${e.message}`);
    continue;
  }
}

console.log('Warning: Could not fix sharp automatically. Manual intervention may be required.');
console.log('This may work at build time if network configuration is different.');
process.exit(0); // Don't fail the install
