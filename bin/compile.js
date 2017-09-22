const fs = require('fs-extra');
const path = require('path');
const debug = require('debug')('app:bin:compile');
const webpackCompiler = require('../config/webpack-compiler');
const webpackConfig = require('../config/webpack.config');
const config = require('../config');

const compile = () => {
  debug('Starting compiler.');
  return Promise.resolve()
    .then(() => webpackCompiler(webpackConfig))
    .then(stats => {
      debug('Copying static assets to dist folder.');
      fs.copySync(path.resolve('./src/static'), path.resolve('./dist'));
    })
    .then(() => {
      debug('Compilation completed successfully.');
    })
    .catch((err) => {
      debug('Compiler encountered an error.', err);
      process.exit(1);
    });
};

compile();
