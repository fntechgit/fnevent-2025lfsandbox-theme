// Patched version of buildPolyfills.js to fix "Cannot set property navigator" error
// This file replaces the problematic buildPolyfills.js from @openeventkit/event-site

const matchMedia = require('matchmediaquery');
const { JSDOM } = require('jsdom');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
});
const { window } = jsdom;

global.window = window;
global.window.matchMedia = matchMedia;
global.document = window.document;

// Ensure window.history is available with state property
if (!global.window.history || typeof global.window.history.state === 'undefined') {
  global.window.history = {
    length: 0,
    scrollRestoration: 'auto',
    state: null,
    back: () => {},
    forward: () => {},
    go: () => {},
    pushState: () => {},
    replaceState: () => {},
  };
}

// Fix: Use Object.defineProperty for navigator to avoid read-only property error
if (window.navigator) {
  try {
    // First try to delete existing navigator property if it exists and is configurable
    delete global.navigator;
  } catch (e) {
    // Ignore if delete fails
  }

  try {
    // Define navigator as a writable, configurable property
    Object.defineProperty(global, 'navigator', {
      value: window.navigator,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // If defineProperty fails, try direct assignment as fallback
    try {
      global.navigator = window.navigator;
    } catch (assignError) {
      // If both fail, create a minimal navigator object
      console.warn('Could not set global.navigator, using minimal fallback');
      global.navigator = {
        userAgent: window.navigator.userAgent || 'Mozilla/5.0',
        platform: 'node',
        languages: ['en'],
        language: 'en',
      };
    }
  }
}

global.XMLHttpRequest = XMLHttpRequest;
