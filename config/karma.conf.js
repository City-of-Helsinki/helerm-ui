const argv = require('yargs').argv;
const config = require('../config');
const webpackConfig = require('./webpack.config');
const debug = require('debug')('app:karma');

debug('Creating configuration.');
const karmaConfig = {
  basePath: '../', // project root in relation to bin/karma.js
  files: [
    {
      pattern: `./${config.dir_test}/test-bundler.js`,
      watched: false,
      served: true,
      included: true
    },
    'node_modules/babel-polyfill/dist/polyfill.js'
  ],
  singleRun: !argv.watch,
  frameworks: ['mocha'],
  reporters: ['mocha'],
  preprocessors: {
    [`${config.dir_test}/test-bundler.js`]: ['webpack', 'sourcemap']
  },
  browsers: ['PhantomJS'],
  webpack: {
    devtool: 'inline-source-map',
    resolve: Object.assign({}, webpackConfig.resolve, {
      alias: Object.assign({}, webpackConfig.resolve.alias, {
        sinon: 'sinon/pkg/sinon.js'
      })
    }),
    plugins: webpackConfig.plugins,
    module: {
      noParse: [/\/sinon\.js/],
      rules: webpackConfig.module.rules.concat([
        {
          test: /sinon(\\|\/)pkg(\\|\/)sinon\.js/,
          loader: 'imports-loader?define=>false,require=>false'
        }
      ])
    },
    // Enzyme fix, see:
    // https://github.com/airbnb/enzyme/issues/47
    externals: Object.assign({}, webpackConfig.externals, {
      'react/addons': true,
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': 'window'
    }),
    sassLoader: webpackConfig.sassLoader
  },
  webpackMiddleware: {
    noInfo: true
  },
  coverageReporter: {
    reporters: [{ type: 'text-summary' }, { type: 'lcov', dir: 'coverage' }]
  }
};

if (config.globals.__COVERAGE__) {
  karmaConfig.reporters.push('coverage');
  karmaConfig.webpack.module.rules.concat([
    {
      enforce: 'pre',
      test: /\.(js|jsx)$/,
      include: new RegExp('src'),
      loader: 'babel',
      query: Object.assign({}, config.compiler_babel, {
        plugins: (config.compiler_babel.plugins || []).concat('istanbul')
      })
    }
  ]);
}

module.exports = cfg => cfg.set(karmaConfig);
