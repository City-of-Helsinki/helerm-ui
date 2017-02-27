import { Passport } from 'passport';
import HelsinkiStrategy from 'passport-helsinki';
import _debug from 'debug';
const debug = _debug('app:auth');

import config from '../../config';

const helsinkiStrategy = new HelsinkiStrategy({
  clientID: config.globals.CLIENT_ID,
  clientSecret: config.globals.CLIENT_SECRET,
  callbackURL: `${config.globals.APP_URL}/auth/login/helsinki/return`
}, (accessToken, refreshToken, profile, done) => {
  debug('access token:', accessToken);
  debug('refresh token:', refreshToken);
  debug('acquiring token from api...');
  helsinkiStrategy.getAPIToken(accessToken, null, (token) => {
    profile.token = token;
    return done(null, profile);
  });
});

const passport = new Passport();
passport.use(helsinkiStrategy);

passport.serializeUser((user, done) => {
  debug('serializing user:', user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  debug('deserializing user:', user);
  done(null, user);
});

/**
 * Successfull auth callback
 * @param req
 * @param res
 */
function authCallback (req, res) {
  debug('Authcallback');
  const js = 'setTimeout(function() {if(window.opener) { window.close(); } else { location.href = "/"; } }, 300);';
  const html = `<html><body>Login successful.<script>${js}</script>`;
  res.send(html);
}

/**
 * Get current logged in user
 * @param req
 * @param res
 */
function getCurrentUser (req, res) {
  debug('CurrentUser');
  res.json(req.user || {});
}

/**
 * Logout
 * @param req
 * @param res
 */
function logOut (req, res) {
  req.logout();
  const redirectUrl = req.query.next || `${config.globals.APP_URL}`;
  res.redirect(`https://api.hel.fi/sso/logout/?next=${redirectUrl}`);
}

export default { passport, authCallback, getCurrentUser, logOut };
