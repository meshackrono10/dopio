import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/stk-push', authMiddleware, paymentController.initiateStkPush);
router.post('/callback', paymentController.mpesaCallback);
router.get('/status', authMiddleware, paymentController.getPaymentStatus);
router.get('/history', authMiddleware, paymentController.getPaymentHistory);
router.get('/earnings', authMiddleware, paymentController.getHunterEarnings);
router.post('/withdraw', authMiddleware, paymentController.requestWithdrawal);

export default router;
