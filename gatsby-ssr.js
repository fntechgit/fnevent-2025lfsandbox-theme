/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/
 */

// Fix for "Cannot set property navigator of #<Object> which has only a getter" error
// This sets up a writable navigator object for SSR
exports.onPreRenderHTML = ({ getHeadComponents, replaceHeadComponents }) => {
  // Set up navigator object with writable properties for SSR
  if (typeof global !== 'undefined' && !global.navigator) {
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Node.js) GatsbySSR',
      platform: 'node',
      languages: ['en'],
      language: 'en',
    };
  }

  const headComponents = getHeadComponents();
  replaceHeadComponents(headComponents);
};
