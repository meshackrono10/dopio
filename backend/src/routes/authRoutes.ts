import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware'; // Assuming authMiddleware is in this path

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/account', authMiddleware, authController.deleteAccount);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/reset-password', authController.resetPassword);
router.get('/validate', authMiddleware, authController.validateSession);
// router.post('/google', authController.googleLogin);
// router.get('/me', authMiddleware, authController.getMe);

export default router;
