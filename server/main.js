import express from 'express';
import _debug from 'debug';
import webpack from 'webpack';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import path from 'path';

import webpackConfig from '../config/webpack.config';
import config from '../config';
import authRoutes from './routes/auth';
import { passport } from './controllers/authController';

const debug = _debug('app:server');
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 's', secret: config.globals.JWT_TOKEN, maxAge: 86400 * 1000 }));
app.use(passport.initialize());
app.use(passport.session());

/**
 * Add authorization routes
 */
app.use('/auth', authRoutes);

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (config.env === 'development') {
  const compiler = webpack(webpackConfig);

  app.use(require('connect-history-api-fallback')());

  debug('Enable webpack dev and HMR middleware');
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: path.resolve('./src'),
    hot: true,
    quiet: false,
    noInfo: false,
    lazy: false,
    stats: "normal",
  }));

  app.use(require('webpack-hot-middleware')(compiler));

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(express.static(path.resolve('./src/static')));
} else {
  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(path.resolve('./dist')));

  app.get('*', function (req, res) {
    res.sendFile(path.resolve('./dist/index.html'));
  });
}

export default app;
