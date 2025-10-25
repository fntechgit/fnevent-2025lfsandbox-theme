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

  // Create a new writable navigator object
  global.navigator = {
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
  };
}

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  if (stage === 'build-html' || stage === 'develop-html') {
    // Additional webpack config for SSR if needed
    actions.setWebpackConfig({
      resolve: {
        fallback: {
          fs: false,
          net: false,
          tls: false,
        },
      },
    });
  }
};
