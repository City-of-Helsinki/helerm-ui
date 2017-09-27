const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const path = require('path');
const config = require('../config');
const debug = require('debug')('app:webpack:config');

const __DEV__ = config.globals.__DEV__;
const __PROD__ = config.globals.__PROD__;
const __TEST__ = config.globals.__TEST__;

const extractStyles = new ExtractTextPlugin({
  filename: 'styles/[name].[contenthash].css',
  allChunks: true,
  disable: __DEV__,
})

debug('Creating configuration.');
const webpackConfig = {
  devtool : __DEV__ ? 'source-map' : false,
  resolve : {
    modules    : [path.resolve('src'), 'node_modules'],
    extensions : ['*', '.js', '.jsx', '.json']
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
    rules: [
      {
        test    : /\.(js|jsx)$/,
        exclude : /node_modules/,
        loader  : 'babel-loader',
        options : config.compiler_babel
      },
      {
        test: /\.(sass|scss)$/,
        loader: extractStyles.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: {
                  autoprefixer: {
                    add: true,
                    remove: true,
                    browsers: ['last 2 versions'],
                  },
                  discardComments: {
                    removeAll : true,
                  },
                  discardUnused: false,
                  mergeIdents: false,
                  reduceIdents: false,
                  safe: true,
                  sourcemap: true,
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                includePaths: [
                  'src/styles',
                ],
              },
            }
          ],
        })
      },
      { test: /\.woff(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[ext]',
          limit: 10000,
          mimetype: 'application/font-woff'
        },
      },
      { test: /\.woff2(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[ext]',
          limit: 10000,
          mimetype: 'application/font-woff2'
        },
      },
      { test: /\.otf(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[ext]',
          limit: 10000,
          mimetype: 'application/font-otf'
        },
      },
      { test: /\.ttf(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[ext]',
          limit: 10000,
          mimetype: 'application/font-ttf'
        },
      },
      { test: /\.eot(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[ext]',
          limit: 10000,
          mimetype: 'application/font-eot'
        },
      },
      { test: /\.svg(\?.*)?$/,
        loader: 'url-loader',
        options: {
          name: 'fonts/[name].[ext]',
          limit: 10000,
          mimetype: 'application/font-svg'
        },
      },
      { test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
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
    }),
    extractStyles,
  ],
};

if (__DEV__) {
  debug('Enable plugins for live development (HMR, NoErrors).');
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new DashboardPlugin()
  );
} else if (__PROD__) {
  debug('Enable plugins for production (OccurenceOrder & UglifyJS).');
  webpackConfig.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
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

module.exports = webpackConfig;
