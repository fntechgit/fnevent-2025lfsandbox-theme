#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Checking if sharp is properly installed before build...');

// Try to require sharp
try {
  const sharp = require('sharp');
  console.log('✓ sharp is working correctly');
  process.exit(0);
} catch (e) {
  console.error('✗ sharp is not working:', e.message);
  console.log('Attempting to fix sharp before build...');
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

// Try aggressive installation methods
const methods = [
  () => {
    console.log('Attempting: Force reinstall sharp with platform flags...');
    execSync('npm install --force --ignore-scripts=false --platform=linux --arch=x64 sharp@0.32.6', {
      env: cleanEnv,
      stdio: 'inherit'
    });
  },
  () => {
    console.log('Attempting: Rebuild sharp with clean environment...');
    execSync('npm rebuild sharp --ignore-scripts=false', {
      env: cleanEnv,
      stdio: 'inherit'
    });
  },
  () => {
    console.log('Attempting: Install sharp with foreground scripts...');
    execSync('npm install --foreground-scripts --ignore-scripts=false sharp@0.32.6', {
      env: cleanEnv,
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
    require('sharp');
    console.log(`✓ Successfully fixed sharp before build!`);
    process.exit(0);
  } catch (e) {
    console.error(`Method ${i + 1} failed:`, e.message);
  }
}

console.error('ERROR: Could not fix sharp. Build will likely fail.');
console.error('Please check network connectivity and npm configuration.');
process.exit(1);
