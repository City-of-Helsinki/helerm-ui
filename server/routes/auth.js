import express from 'express';
import authCtrl from '../controllers/authController';

const router = express.Router();

/**
 * GET /auth/login/helsinki
 */
router.route('/login/helsinki')
  .get(authCtrl.passport.authenticate('helsinki'));

/**
 * GET /auth/login/helsinki/return
 */
router.route('/login/helsinki/return')
  .get(authCtrl.passport.authenticate('helsinki'), authCtrl.authCallback);

/**
 * GET /auth/me
 */
router.route('/me')
  .get(authCtrl.getCurrentUser);

/**
 * POST /auth/logout
 */
router.route('/logout')
  .post(authCtrl.logOut);

export default router;
