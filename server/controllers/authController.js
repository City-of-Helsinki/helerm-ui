const { Passport } = require("passport");
const HelsinkiStrategy = require("passport-helsinki");
const _debug = require("debug");
const debug = _debug("app:auth");

const helsinkiStrategy = new HelsinkiStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/login/helsinki/return`,
  },
  (accessToken, refreshToken, profile, done) => {
    debug("access token:", accessToken);
    debug("refresh token:", refreshToken);
    debug("acquiring token  = require( api...");
    helsinkiStrategy.getAPIToken(
      accessToken,
      process.env.CLIENT_AUDIENCE,
      (token) => {
        profile.token = token;
        return done(null, profile);
      }
    );
  }
);

const passport = new Passport();
passport.use(helsinkiStrategy);

passport.serializeUser((user, done) => {
  debug("serializing user:", user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  debug("deserializing user:", user);
  done(null, user);
});

/**
 * Successfull auth callback
 * @param req
 * @param res
 */
function authCallback(req, res) {
  debug("Authcallback");
  const redirectUrl = req.session.next || `${process.env.APP_URL}`;
  res.redirect(redirectUrl);
}

/**
 * Get current logged in user
 * @param req
 * @param res
 */
function getCurrentUser(req, res) {
  debug("CurrentUser");
  res.json(req.user || {});
}

function beforeLogin(req, res, next) {
  debug("beforeLogin");
  req.session.next = req.query.next; // eslint-disable-line no-param-reassign
  next();
}

/**
 * Logout
 * @param req
 * @param res
 */
function logOut(req, res) {
  req.logout();
  const redirectUrl = req.query.next || `${process.env.APP_URL}`;
  res.redirect(`https://api.hel.fi/sso/logout/?next=${redirectUrl}`);
}
const authController = {
  passport,
  authCallback,
  getCurrentUser,
  beforeLogin,
  logOut,
};
module.exports = authController;
