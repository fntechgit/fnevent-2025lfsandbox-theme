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

// Configure matchMedia with default values for SSR
// The matchmediaquery library uses css-mediaquery internally, which requires
// a values object with media feature values during matching
const defaultMediaValues = {
  width: 1024,
  height: 768,
  'device-width': 1024,
  'device-height': 768,
  orientation: 'landscape',
  'aspect-ratio': '16/9',
  'device-aspect-ratio': '16/9',
  color: 8,
  'color-index': 256,
  'monochrome': 0,
  resolution: '1dppx',
  scan: 'progressive',
  grid: 0,
  'prefers-reduced-motion': 'no-preference',
  'prefers-color-scheme': 'light',
  'prefers-contrast': 'no-preference',
  'prefers-reduced-transparency': 'no-preference',
};

// Create a wrapper around matchMedia that provides default values
global.window.matchMedia = function(query) {
  return matchMedia(query, defaultMediaValues);
};

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
