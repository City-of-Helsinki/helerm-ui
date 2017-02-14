import { Passport } from 'passport';
import HelsinkiStrategy from 'passport-helsinki';
import jwt from 'jsonwebtoken';
import merge from 'lodash/merge';
import _debug from 'debug';

import config from '../config';

const debug = _debug('app:auth');

function generateToken (profile, options) {
  return jwt.sign(merge({}, profile), options.key, {
    subject: profile.id,
    audience: options.audience
  });
}

export function getPassport () {
  const getTokenFromAPI = true;
  const passport = new Passport();
  const helsinkiStrategy = new HelsinkiStrategy({
    clientID: config.globals.CLIENT_ID,
    clientSecret: config.globals.CLIENT_SECRET,
    callbackURL: `${config.globals.APP_URL}/login/helsinki/return`
  }, (accessToken, refreshToken, profile, done) => {
    debug('access token:', accessToken);
    debug('refresh token:', refreshToken);
    if (getTokenFromAPI) {
      debug('acquiring token from api...');
      helsinkiStrategy.getAPIToken(accessToken, null, (token) => {
        profile.token = token;
        return done(null, profile);
      });
    } else {
      if (profile._json) delete profile._json;
      if (profile._raw) delete profile._raw;
      profile.token = generateToken(profile, { key: config.globals.JWT_TOKEN });
      debug('token generated with options:', { key: config.globals.JWT_TOKEN });
      debug('profile:', profile);
      done(null, profile);
    }
  });
  passport.use(helsinkiStrategy);
  passport.serializeUser((user, done) => {
    debug('serializing user:', user);
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    debug('deserializing user:', user);
    done(null, user);
  });
  return passport;
}

function successfulLoginHandler (req, res) {
  const js = 'setTimeout(function() {if(window.opener) { window.close(); } else { location.href = "/"; } }, 300);';
  res.send('<html><body>Login successful.<script>' + js + '</script>');
}

export function addAuth (server, passport) {
  server.use(passport.initialize());
  server.use(passport.session());
  server.get('/login/helsinki', passport.authenticate('helsinki'));
  server.get('/login/helsinki/return', passport.authenticate('helsinki'), successfulLoginHandler);
  server.get('/logout', (req, res) => {
    res.send('<html><body><form method="post"></form><script>document.forms[0].submit()</script>');
  });
  server.post('/logout', (req, res) => {
    req.logout();
    const redirectUrl = req.query.next || '/';
    res.redirect(`https://api.hel.fi/sso/logout/?next=${redirectUrl}`);
  });
  server.get('/me', (req, res) => {
    res.json(req.user || {});
  });
}
