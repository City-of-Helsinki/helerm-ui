import express from 'express';
import _debug from 'debug';
import webpack from 'webpack';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';

import webpackConfig from '../build/webpack.config';
import config from '../config';
import authRoutes from './routes/auth';
import { passport } from './controllers/authController';

const debug = _debug('app:server');
const app = express();
const paths = config.utils_paths;

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

  debug('Enable webpack dev and HMR middleware');
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: paths.client(),
    hot: true,
    quiet: config.compiler_quiet,
    noInfo: config.compiler_quiet,
    lazy: false,
    stats: config.compiler_stats
  }));

  app.use(require('webpack-hot-middleware')(compiler));

  // This rewrites all routes requests to the root /index.html file
  // (ignoring file requests). If you want to implement universal
  // rendering, you'll want to remove this middleware.
  app.use(require('connect-history-api-fallback')());

  // Serve static assets from ~/src/static since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(express.static(paths.client('static')));
} else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  );

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(paths.dist()));
}

export default app;
