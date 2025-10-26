/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

// Fix for "Cannot set property navigator of #<Object> which has only a getter" error
// This sets up a writable navigator object for SSR
if (typeof global !== 'undefined') {
  // Try to delete the existing navigator property if it exists
  try {
    delete global.navigator;
  } catch (e) {
    // Ignore if property can't be deleted
  }

  // Define navigator as a writable, configurable property
  try {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'Mozilla/5.0 (Node.js) GatsbySSR',
        platform: 'node',
        languages: ['en'],
        language: 'en',
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
    // If defineProperty fails, log the error
    console.warn('Could not set global.navigator:', e.message);
  }

  // Add window polyfill for SSR
  if (typeof window === 'undefined') {
    try {
      global.window = {
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
        },
        navigator: global.navigator,
      };
    } catch (e) {
      console.warn('Could not set global.window:', e.message);
    }
  }
}

exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents();
  replaceHeadComponents(headComponents);
};
