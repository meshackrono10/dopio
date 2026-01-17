import { Router } from 'express';
import * as disputeController from '../controllers/disputeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

router.get('/', authMiddleware, adminMiddleware, disputeController.getDisputes);
router.patch('/:disputeId', authMiddleware, adminMiddleware, disputeController.updateDispute);
router.post('/:disputeId/respond', authMiddleware, disputeController.respondToDispute);

export default router;
