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
      // Helper function to create a mock element
      const createMockElement = () => ({
        style: {},
        setAttribute: () => {},
        getAttribute: () => null,
        removeAttribute: () => {},
        hasAttribute: () => false,
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        getElementsByTagName: () => [createMockElement()],
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false,
          toggle: () => false,
        },
        innerHTML: '',
        textContent: '',
        childNodes: [],
        children: [],
        firstChild: null,
        lastChild: null,
        parentNode: null,
      });

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
          documentElement: Object.assign(createMockElement(), {
            getElementsByTagName: () => [createMockElement()],
          }),
          body: Object.assign(createMockElement(), {
            getElementsByTagName: () => [createMockElement()],
          }),
          createElement: createMockElement,
          getElementsByTagName: () => [createMockElement()],
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

exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  const headComponents = getHeadComponents();
  replaceHeadComponents(headComponents);
};
