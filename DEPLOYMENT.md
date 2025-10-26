# Deployment Configuration

## Known Issues and Fixes

### Partytown Plugin

Gatsby 5.x includes an internal Partytown plugin for optimizing third-party scripts. However, this plugin uses the deprecated `@builder.io/partytown` package which has ESM/CommonJS compatibility issues that cause "Invalid URL" build errors.

**Fix Applied**: The build now includes a module override in `gatsby-node.js` that stubs out the problematic Partytown functions, preventing the error while maintaining build compatibility. This means Partytown functionality is disabled but the build completes successfully.

If you need Partytown functionality, you can manually install and configure `@qwik.dev/partytown` (the updated package) using a custom plugin.

## Other Known Issues

### Sharp Module

If you encounter errors with the `sharp` module during build, this is typically due to network restrictions in the build environment preventing the download of native binaries. This is an environment-specific issue that may need to be resolved with your hosting provider.
