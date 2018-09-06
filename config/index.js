/* eslint key-spacing:0 spaced-comment:0 */
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const debug = require('debug')('app:config');
const argv = require('yargs').argv;
const ip = require('ip');
const dotenv = require('dotenv');
const pkgVersion = require('../package.json').version;

const gitRevisionPlugin = new GitRevisionPlugin();

dotenv.load();

debug('Creating default configuration.');
// ========================================================
// Default Configuration
// ========================================================
const config = {
  env: process.env.NODE_ENV || 'development',

  dir_test: 'tests',

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host: process.env.SERVER_HOST || ip.address(), // use string 'localhost' to prevent exposure on local network
  server_port: process.env.PORT || 3000,

  // ----------------------------------
  // Compiler Configuration
  // ----------------------------------
  compiler_babel: {
    cacheDirectory: true,
    plugins: ['transform-runtime', 'transform-decorators-legacy'],
    presets: ['es2015', 'react', 'stage-0']
  },
  compiler_public_path: '/'
};

/************************************************
 -------------------------------------------------

 All Internal Configuration Below
 Edit at Your Own Risk

 -------------------------------------------------
 ************************************************/

// ------------------------------------
// Environment
// ------------------------------------
// N.B.: globals added here must _also_ be added to .eslintrc
config.globals = {
  'process.env': {
    NODE_ENV: JSON.stringify(config.env)
  },
  NODE_ENV: config.env,
  __DEV__: config.env === 'development',
  __PROD__: config.env === 'production',
  __TEST__: config.env === 'test',
  __COVERAGE__: !argv.watch && config.env === 'test',
  __BASENAME__: JSON.stringify(process.env.BASENAME || ''),
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  CLIENT_AUDIENCE: process.env.CLIENT_AUDIENCE || null,
  VERSION: JSON.stringify(pkgVersion),
  GIT_VERSION: JSON.stringify(gitRevisionPlugin.version()),
  GIT_COMMIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()),
  JWT_TOKEN: process.env.JWT_TOKEN,
  PIWIK_URL: JSON.stringify(process.env.PIWIK_URL),
  PIWIK_ID: JSON.stringify(process.env.PIWIK_ID),
  APP_URL: process.env.APP_URL,
  API_URL: JSON.stringify(process.env.API_URL),
  API_VERSION: JSON.stringify(process.env.API_VERSION),
  SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
  SENTRY_REPORT_DIALOG: process.env.SENTRY_REPORT_DIALOG,
  RESULTS_PER_PAGE: JSON.stringify(process.env.RESULTS_PER_PAGE),
  STORAGE_PREFIX: JSON.stringify(process.env.STORAGE_PREFIX || 'HELERM'),
  FEEDBACK_EMAIL: JSON.stringify(process.env.FEEDBACK_EMAIL),
  SITE_TITLE: JSON.stringify(process.env.SITE_TITLE || '')
};

// ========================================================
// Environment Configuration
// ========================================================
debug(`Looking for environment overrides for NODE_ENV "${config.env}".`);
const environments = require('./environments');
const overrides = environments[config.env];
if (overrides) {
  debug('Found overrides, applying to default configuration.');
  Object.assign(config, overrides(config));
} else {
  debug('No environment overrides found, defaults will be used.');
}

module.exports = config;
