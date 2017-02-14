import express from 'express';
import authCtrl from '../controllers/authController';

const router = express.Router();

/**
 * GET /auth
 */
router.route('/')
  .get(authCtrl.login);

export default router;
