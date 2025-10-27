#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('=== Prebuild: Sharp setup ===');

// Check if sharp works already
try {
  const sharp = require('sharp');
  console.log('✓ sharp is already working');
  console.log('  sharp version:', sharp.versions.sharp);
  console.log('  libvips version:', sharp.versions.vips);
  console.log('');
  process.exit(0);
} catch (e) {
  console.log('✗ Sharp is not working:', e.message);
  console.log('Attempting to fix sharp before build...\n');
}

// Since npm install runs with ignore-scripts=true (see .npmrc),
// sharp's install script didn't run and the native binary wasn't downloaded.
// We need to explicitly reinstall sharp with scripts enabled.

const methods = [
  {
    name: 'Reinstall sharp with scripts and platform flags',
    cmd: 'npm install --ignore-scripts=false --foreground-scripts --platform=linux --arch=x64 sharp'
  },
  {
    name: 'Force reinstall sharp with scripts enabled',
    cmd: 'npm install --ignore-scripts=false --foreground-scripts --force sharp'
  },
  {
    name: 'Rebuild sharp with scripts enabled',
    cmd: 'npm rebuild --ignore-scripts=false sharp'
  }
];

for (let i = 0; i < methods.length; i++) {
  const method = methods[i];
  try {
    console.log(`Method ${i + 1}: ${method.name}`);
    console.log(`  Running: ${method.cmd}\n`);

    execSync(method.cmd, {
      stdio: 'inherit',
      env: {
        ...process.env,
      }
    });

    // Clear require cache for sharp
    Object.keys(require.cache).forEach(key => {
      if (key.includes('sharp')) {
        delete require.cache[key];
      }
    });

    // Test if it works now
    const sharp = require('sharp');
    console.log(`\n✓ Successfully fixed sharp using method ${i + 1}!`);
    console.log('  sharp version:', sharp.versions.sharp);
    console.log('  libvips version:', sharp.versions.vips);
    console.log('');
    process.exit(0);
  } catch (e) {
    console.error(`✗ Method ${i + 1} failed:`, e.message);
    console.log('');
  }
}

console.error('ERROR: Could not fix sharp after trying all methods.');
console.error('Build will fail. Please check:');
console.error('  1. Network connectivity for downloading sharp binaries');
console.error('  2. Aptfile contains libvips-dev and libvips-tools');
console.error('  3. Buildpack order (heroku-community/apt before heroku/nodejs)');
process.exit(1);
