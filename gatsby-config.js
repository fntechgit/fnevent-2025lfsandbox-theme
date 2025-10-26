// Set default environment variables if not already defined
// This prevents build errors when GATSBY_PARTYTOWN_PROXY_URL is not set
process.env.GATSBY_PARTYTOWN_PROXY_URL = process.env.GATSBY_PARTYTOWN_PROXY_URL || 'http://localhost/~partytown/';

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  /*flags: {
    DEV_SSR: true
  },*/
  plugins: [
    "@openeventkit/event-site"
  ]
};
