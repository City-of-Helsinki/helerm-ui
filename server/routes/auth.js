const express = require("express");
const authCtrl = require("../controllers/authController");

const router = express.Router();

/**
 * GET /auth/login/helsinki
 */
router
  .route("/login/helsinki")
  .get(authCtrl.beforeLogin, authCtrl.passport.authenticate("helsinki"));

/**
 * GET /auth/login/helsinki/return
 */
router
  .route("/login/helsinki/return")
  .get(authCtrl.passport.authenticate("helsinki"), authCtrl.authCallback);

/**
 * GET /auth/me
 */
router.route("/me").get(authCtrl.getCurrentUser);

/**
 * POST /auth/logout
 */
router.route("/logout").get(authCtrl.logOut);

module.exports = router;
