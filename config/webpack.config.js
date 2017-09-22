const webpack = require('webpack');
const cssnano = require('cssnano');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const path = require('path');
const config = require('../config');
const debug = require('debug')('app:webpack:config');

const __DEV__ = config.globals.__DEV__;
const __PROD__ = config.globals.__PROD__;
const __TEST__ = config.globals.__TEST__;

debug('Creating configuration.');
const webpackConfig = {
  devtool : __DEV__ ? 'source-map' : null,
  resolve : {
    root       : path.resolve('./src'),
    extensions : ['', '.js', '.jsx', '.json']
  },
  entry: {
    app : __DEV__
      ? [path.resolve('./src/main.js'), `webpack-hot-middleware/client?path=${config.compiler_public_path}__webpack_hmr`]
      : [path.resolve('./src/main.js')],
    vendor : [
      'react',
      'react-redux',
      'react-router',
      'redux'
    ]
  },
  output: {
    filename   : __DEV__ ? '[name].js' : '[name].[chunkhash].js',
    path       : path.resolve('./dist'),
    publicPath : config.compiler_public_path
  },
  module : {
    loaders: [
      {
        test    : /\.(js|jsx)$/,
        exclude : /node_modules/,
        loader  : 'babel',
        query   : config.compiler_babel
      },
      {
        test   : /\.json$/,
        loader : 'json'
      },
      {
        test    : /\.scss$/,
        exclude : null,
        loaders : [
          'style',
          // We use cssnano with the postcss loader, so we tell
          // css-loader not to duplicate minimization.
          'css?sourceMap&-minimize',
          'postcss',
          'sass?sourceMap'
        ]
      },
      {
        test    : /\.css$/,
        exclude : null,
        loaders : [
          'style',
          // We use cssnano with the postcss loader, so we tell
          // css-loader not to duplicate minimization.
          'css?sourceMap&-minimize',
          'postcss'
        ]
      },
      { test: /\.woff(\?.*)?$/,loader: 'url?prefix=fonts/&name=assets/[name].[ext]&limit=10000&mimetype=application/font-woff' },
      { test: /\.woff2(\?.*)?$/, loader: 'url?prefix=fonts/&name=assets/[name].[ext]&limit=10000&mimetype=application/font-woff2' },
      { test: /\.otf(\?.*)?$/, loader: 'file?prefix=fonts/&name=assets/[name].[ext]&limit=10000&mimetype=font/opentype' },
      { test: /\.ttf(\?.*)?$/, loader: 'url?prefix=fonts/&name=assets/[name].[ext]&limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?.*)?$/, loader: 'file?prefix=fonts/&name=assets/[name].[ext]' },
      { test: /\.svg(\?.*)?$/, loader: 'url?prefix=fonts/&name=assets/[name].[ext]&limit=10000&mimetype=image/svg+xml' },
      { test: /\.(png|jpg)$/, loader: 'url?name=assets/[name].[ext]&limit=8192' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin(config.globals),
    new HtmlWebpackPlugin({
      template : path.resolve('./src/index.html'),
      hash     : false,
      favicon  : path.resolve('./src/static/favicon.ico'),
      filename : 'index.html',
      inject   : 'body',
      minify   : {
        collapseWhitespace : true
      },
      VERSION: config.globals.GIT_VERSION,
      HASH: config.globals.GIT_COMMIT_HASH
    })
  ],
};

webpackConfig.sassLoader = {
  includePaths : path.resolve('./src/styles'),
};

webpackConfig.postcss = [
  cssnano({
    autoprefixer : {
      add      : true,
      remove   : true,
      browsers : ['last 2 versions']
    },
    discardComments : {
      removeAll : true
    },
    discardUnused : false,
    mergeIdents   : false,
    reduceIdents  : false,
    safe          : true,
    sourcemap     : true
  })
];

if (__DEV__) {
  debug('Enable plugins for live development (HMR, NoErrors).');
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new DashboardPlugin()
  );
} else if (__PROD__) {
  debug('Enable plugins for production (OccurenceOrder, Dedupe & UglifyJS).');
  webpackConfig.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress : {
        unused    : true,
        dead_code : true,
        warnings  : false
      }
    })
  );
}

// Don't split bundles during testing, since we only want import one bundle
if (!__TEST__) {
  webpackConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      names : ['vendor']
    })
  );
}

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
if (!__DEV__) {
  debug('Apply ExtractTextPlugin to CSS loaders.');
  webpackConfig.module.loaders.filter((loader) =>
    loader.loaders && loader.loaders.find((name) => /css/.test(name.split('?')[0]))
  ).forEach((loader) => {
    const first = loader.loaders[0];
    const rest = loader.loaders.slice(1);
    loader.loader = ExtractTextPlugin.extract(first, rest.join('!'));
    delete loader.loaders;
  });

  webpackConfig.plugins.push(
    new ExtractTextPlugin('[name].[contenthash].css', {
      allChunks : true
    })
  );
}

module.exports = webpackConfig;
