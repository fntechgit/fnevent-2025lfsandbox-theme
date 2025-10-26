/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

// Fix for Partytown "Invalid URL" error
// Gatsby's internal Partytown plugin uses @builder.io/partytown which has ESM/CommonJS compatibility issues
// We need to prevent the plugin from loading by stubbing the required module
try {
  // Create a mock module for @builder.io/partytown/utils
  const Module = require('module');
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(id) {
    if (id === '@builder.io/partytown/utils') {
      // Return a mock with the functions Gatsby expects
      return {
        copyLibFiles: async () => {
          console.log('[Partytown] Skipping copyLibFiles - internal plugin disabled');
          return { src: '', dest: '' };
        },
        libDirPath: () => ''
      };
    }
    return originalRequire.apply(this, arguments);
  };
} catch (e) {
  console.warn('Could not patch Partytown module:', e.message);
}

// Fix for LMDB "Invalid URL" error
// LMDB tries to load compression dictionaries using new URL() with file paths
// In certain build environments, this fails because __filename or __dirname are not properly set
// We patch the global URL constructor and fs.readFileSync to handle these cases gracefully
try {
  const OriginalURL = global.URL;
  global.URL = class PatchedURL extends OriginalURL {
    constructor(url, base) {
      // If this looks like a file path operation that might fail, provide a safe fallback
      try {
        super(url, base);
      } catch (error) {
        if (error.message && error.message.includes('Invalid URL')) {
          // Provide a dummy file URL that won't break LMDB initialization
          // LMDB only needs this for compression dictionaries which we don't use
          console.warn('[LMDB] Caught Invalid URL error, using fallback:', error.message);
          super('file:///lmdb-dict-disabled');
        } else {
          throw error;
        }
      }
    }
  };
  // Copy over static methods
  Object.setPrototypeOf(global.URL, OriginalURL);
  global.URL.createObjectURL = OriginalURL.createObjectURL;
  global.URL.revokeObjectURL = OriginalURL.revokeObjectURL;

  // Also patch fs.readFileSync to handle the dictionary file read
  const fs = require('fs');
  const originalReadFileSync = fs.readFileSync;
  fs.readFileSync = function(path, options) {
    // If LMDB is trying to read the compression dictionary, return an empty buffer
    if (typeof path === 'string' && path.includes('dict.txt')) {
      console.warn('[LMDB] Intercepted dictionary file read, returning empty buffer');
      return Buffer.alloc(0);
    }
    return originalReadFileSync.apply(this, arguments);
  };
} catch (e) {
  console.warn('Could not patch URL constructor or fs:', e.message);
}

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

  // Add window polyfill for SSR
  if (typeof window === 'undefined') {
    try {
      // Create a comprehensive window mock for SSR
      const mockWindow = {
        matchMedia: (query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
        document: {
          documentElement: {
            style: {},
          },
          body: {
            style: {},
          },
          createElement: () => ({
            style: {},
          }),
        },
        navigator: global.navigator,
        getComputedStyle: () => ({
          getPropertyValue: () => '',
          'prefers-reduced-motion': 'no-preference',
        }),
        addEventListener: () => {},
        removeEventListener: () => {},
        location: {
          href: 'http://localhost',
          origin: 'http://localhost',
          protocol: 'http:',
          host: 'localhost',
          hostname: 'localhost',
          port: '',
          pathname: '/',
          search: '',
          hash: '',
        },
        localStorage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
        },
        sessionStorage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
        },
      };

      global.window = mockWindow;
      global.document = mockWindow.document;
      global.localStorage = mockWindow.localStorage;
      global.sessionStorage = mockWindow.sessionStorage;
    } catch (e) {
      console.warn('Could not set global.window:', e.message);
    }
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
