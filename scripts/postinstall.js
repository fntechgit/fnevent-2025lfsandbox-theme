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

// Rebuild sharp with scripts enabled (npm install runs with ignore-scripts=true)
// This allows us to avoid issues with other packages while ensuring sharp works
try {
  console.log('Rebuilding sharp...');

  // Configure environment for sharp rebuild
  const rebuildEnv = {
    ...process.env,
    npm_config_ignore_scripts: 'false',
  };

  // If SHARP_FORCE_GLOBAL_LIBVIPS is set (e.g., on Heroku), configure for system libvips
  if (process.env.SHARP_FORCE_GLOBAL_LIBVIPS === 'true') {
    console.log('Using system libvips (SHARP_FORCE_GLOBAL_LIBVIPS=true)');
    // Disable binary downloads and use system libvips
    rebuildEnv.npm_config_sharp_libvips_binary_host = '';
    rebuildEnv.SHARP_IGNORE_GLOBAL_LIBVIPS = '0';
  }

  // Use npm rebuild with scripts enabled for sharp only
  execSync('npm rebuild sharp', {
    stdio: 'inherit',
    env: rebuildEnv
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
  console.error('\n✗ Failed to rebuild sharp:', e.message);
  console.error('The build may fail. Check sharp installation.\n');
  // Don't exit with error - let the build try and fail with better error messages
}
