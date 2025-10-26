/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

// Set GATSBY_PARTYTOWN_PROXY_URL environment variable early to prevent build errors
// This must be set before Gatsby loads its internal Partytown plugin
if (!process.env.GATSBY_PARTYTOWN_PROXY_URL) {
  process.env.GATSBY_PARTYTOWN_PROXY_URL = 'http://localhost/~partytown/';
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
