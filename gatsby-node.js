/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

// Fix for "Cannot set property navigator of #<Object> which has only a getter" error
// Set up writable navigator object before webpack compilation
if (typeof global !== 'undefined') {
  // Delete the read-only navigator if it exists
  try {
    delete global.navigator;
  } catch (e) {
    // Ignore errors if property can't be deleted
  }

  // Define navigator as a writable, configurable property
  try {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Node.js) GatsbySSR',
        platform: 'node',
        languages: ['en'],
        language: 'en',
        // Add common navigator properties that might be accessed
        onLine: true,
        cookieEnabled: false,
        appName: 'Netscape',
        appVersion: '5.0',
        maxTouchPoints: 0,
      },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // Fallback to direct assignment if defineProperty fails
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Node.js) GatsbySSR',
      platform: 'node',
      languages: ['en'],
      language: 'en',
      onLine: true,
      cookieEnabled: false,
      appName: 'Netscape',
      appVersion: '5.0',
      maxTouchPoints: 0,
    };
  }
}

exports.onCreateWebpackConfig = ({ stage, actions, plugins }) => {
  const path = require('path');
  const webpack = require('webpack');

  if (stage === 'build-html' || stage === 'develop-html') {
    // Additional webpack config for SSR if needed
    actions.setWebpackConfig({
      plugins: [
        // Use NormalModuleReplacementPlugin to replace the problematic buildPolyfills.js
        new webpack.NormalModuleReplacementPlugin(
          /@openeventkit\/event-site\/src\/utils\/buildPolyfills/,
          path.resolve(__dirname, 'src/patches/buildPolyfills.js')
        ),
      ],
      resolve: {
        alias: {
          // Also add alias as a fallback
          '@openeventkit/event-site/src/utils/buildPolyfills.js': path.resolve(
            __dirname,
            'src/patches/buildPolyfills.js'
          ),
          '@openeventkit/event-site/src/utils/buildPolyfills': path.resolve(
            __dirname,
            'src/patches/buildPolyfills.js'
          ),
        },
        fallback: {
          fs: false,
          net: false,
          tls: false,
        },
      },
    });
  }
};
