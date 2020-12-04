const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * CRA's development server will only attempt to send requests without
 * text/html in the Accept header to the proxy. This is no bueno because
 * with the current implementation auth requests from the browser do
 * contain that header so we use this small config to mitigate that.
 */
module.exports = function (app) {
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:3030',
      changeOrigin: true
    })
  );
};
