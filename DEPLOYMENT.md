# Deployment Configuration

## Known Issues and Fixes

### Partytown Plugin Error

**Issue**: Gatsby 5.x includes an internal Partytown plugin that uses the deprecated `@builder.io/partytown` package, which has ESM/CommonJS compatibility issues causing "Invalid URL" errors during the "load gatsby config" phase.

**Fix Applied**: Module override in `gatsby-node.js:10-30` that stubs out the Partytown utility functions.

### LMDB Datastore Error

**Issue**: Gatsby's LMDB datastore tries to load compression dictionaries using file URLs during initialization. In certain build environments (e.g., Heroku), file path resolution fails, causing "TypeError: Invalid URL" in the LMDB `makeCompression` function.

**Fix Applied**: Global URL constructor patch in `gatsby-node.js:36-61` that catches Invalid URL errors and provides a safe fallback. This allows LMDB to initialize successfully without compression dictionary support (which is optional and not used by default).

### Impact

Both fixes are non-invasive workarounds that:
- Allow the build to complete successfully
- Don't affect core Gatsby functionality
- Disable optional features that aren't critical for the build

If you need Partytown functionality in the future, you can manually install `@qwik.dev/partytown` as a separate plugin.

## Other Known Issues

### Sharp Module

If you encounter errors with the `sharp` module during build, this is typically due to network restrictions in the build environment preventing the download of native binaries. This is an environment-specific issue that may need to be resolved with your hosting provider.
