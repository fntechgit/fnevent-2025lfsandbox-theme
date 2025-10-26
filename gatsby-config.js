// Set default environment variables if not already defined
// This is a fallback in case it wasn't set in gatsby-node.js
// Note: The primary fix is in gatsby-node.js which runs earlier
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
