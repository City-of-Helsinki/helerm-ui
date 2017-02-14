const constants = require('./constants');

// Here is where you can define configuration overrides based on the execution environment.
// Supply a key to the default export matching the NODE_ENV that you wish to target, and
// the base configuration will apply your overrides before exporting itself.
module.exports = {
  // ======================================================
  // Overrides when NODE_ENV === 'development'
  // ======================================================
  // NOTE: In development, we use an explicit public path when the assets
  // are served webpack by to fix this issue:
  // http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
  development : (config) => ({
    compiler_public_path : `http://${config.server_host}:${config.server_port}/`,
    globals: Object.assign({}, config.globals, {
      API_URL         : JSON.stringify(constants.API_URL),
      API_VERSION     : JSON.stringify(constants.API_VERSION),
      RESULTS_PER_PAGE: JSON.stringify(constants.RESULTS_PER_PAGE)
    })
  }),

  // ======================================================
  // Overrides when NODE_ENV === 'production'
  // ======================================================
  production : (config) => ({
    compiler_public_path     : '/',
    compiler_fail_on_warning : false,
    compiler_hash_type       : 'chunkhash',
    compiler_devtool         : null,
    compiler_stats           : {
      chunks       : true,
      chunkModules : true,
      colors       : true
    },
    globals: Object.assign({}, config.globals, {
      API_URL         : process.env.API_URL || JSON.stringify(constants.API_URL),
      API_VERSION     : process.env.API_VERSION || JSON.stringify(constants.API_VERSION),
      RESULTS_PER_PAGE: process.env.RESULTS_PER_PAGE || JSON.stringify(constants.RESULTS_PER_PAGE)
    })
  })
};
